import "server-only";

import {
  NoObjectGeneratedError,
  generateText,
  jsonSchema,
  Output,
  tool,
} from "ai";
import type { ModelMessage, Tool, LanguageModelUsage } from "ai";

import { serverEnv, type ServerEnv } from "@/lib/env/server";
import { AiProviderError, fromSdkError } from "@/lib/ai/errors";
import type {
  AiClient,
  AgentMessage,
  GenerateStepInput,
  GenerateStepResult,
  JsonSchema,
  LanguageModelInstance,
  ToolDescriptor,
  Usage,
} from "@/lib/ai/types";
import { resolveModel } from "@/lib/ai/registry";

type AiSdkResult = {
  readonly finishReason: string;
  readonly toolCalls: Array<{ toolCallId: string; toolName: string; input: unknown }>;
  readonly usage: LanguageModelUsage;
  readonly output: unknown;
};

type GenerateTextRequest = {
  model: LanguageModelInstance;
  system: string;
  messages: ModelMessage[];
  tools?: Record<string, Tool>;
  output?: ReturnType<typeof Output.object>;
  providerOptions?: Record<string, Record<string, unknown>>;
  maxRetries: number;
  abortSignal: AbortSignal;
};

/**
 * OpenAI's constrained-decode mode ("strict" structured output) accepts only a subset of JSON
 * Schema: it forbids `propertyNames`, and it requires every key of an object to appear in
 * `required`, so an optional field must be modelled as a nullable one instead. The proposition's
 * provenance shapes are neither — a `ref` carries whichever of `variationId`, `questionId`,
 * `editTurn`, `turnId` and `quote` applies, and a bare warning value is a recursive record. A live
 * run against `gpt-5.6-luna` returned 400 `invalid_json_schema` on exactly that.
 *
 * Turning strict off makes the schema a decoding hint rather than a decoding constraint. It is not
 * a loosening of any boundary this application relies on: the model's output is authoritative only
 * after `run()` parses it with the Zod output schema and `validateAgentOutput` resolves every
 * reference, and output that does not conform is already a retried, then failed, turn. The setting
 * is namespaced by provider, so it is inert for Anthropic.
 */
const OPENAI_PROVIDER_OPTIONS = { openai: { strictJsonSchema: false } } as const;

export type GenerateTextDependency = (request: GenerateTextRequest) => Promise<AiSdkResult>;

export type AiClientDeps = {
  generateText: GenerateTextDependency;
  resolveModel: typeof resolveModel;
};

const defaultDeps: AiClientDeps = {
  generateText: (request) => generateText(request as Parameters<typeof generateText>[0]) as Promise<AiSdkResult>,
  resolveModel,
};

function toUsage(usage: LanguageModelUsage | undefined): Usage {
  return {
    inputTokens: usage?.inputTokens ?? null,
    outputTokens: usage?.outputTokens ?? null,
    totalTokens: usage?.totalTokens ?? null,
  };
}

function asJsonSchema(schema: JsonSchema): Parameters<typeof jsonSchema>[0] {
  return schema as Parameters<typeof jsonSchema>[0];
}

function toSdkMessages(messages: AgentMessage[]): ModelMessage[] {
  return messages.map((message): ModelMessage => {
    if ("content" in message) return message;

    if (message.role === "assistant") {
      return {
        role: "assistant",
        content: message.toolCalls.map((call) => ({
          type: "tool-call" as const,
          toolCallId: call.toolCallId,
          toolName: call.name,
          input: call.input,
        })),
      };
    }

    return {
      role: "tool",
      content: message.results.map((result) => ({
        type: "tool-result" as const,
        toolCallId: result.toolCallId,
        toolName: result.name,
        output: { type: "json" as const, value: result.output as never },
      })),
    };
  });
}

function toSdkTools(tools: ToolDescriptor[]): Record<string, Tool> {
  return Object.fromEntries(
    tools.map((descriptor) => [
      descriptor.name,
      tool({
        description: descriptor.description,
        inputSchema: jsonSchema(asJsonSchema(descriptor.inputJsonSchema)),
      }),
    ]),
  );
}

function contentFiltered(operation: string, cause: unknown): AiProviderError {
  return new AiProviderError({ reason: "content_filtered", operation, retryable: false, cause });
}

function mapResult(result: AiSdkResult): GenerateStepResult {
  if (result.finishReason === "content-filter") {
    throw contentFiltered("generateStep", result);
  }

  if (result.toolCalls.length > 0) {
    return {
      kind: "tool_calls",
      calls: result.toolCalls.map((call) => ({
        toolCallId: call.toolCallId,
        name: call.toolName,
        input: call.input,
      })),
      usage: toUsage(result.usage),
    };
  }

  return { kind: "final", output: result.output, usage: toUsage(result.usage) };
}

export async function callModel(model: LanguageModelInstance, request: Omit<GenerateTextRequest, "model" | "maxRetries">, runGenerateText: GenerateTextDependency = defaultDeps.generateText): Promise<AiSdkResult> {
  return runGenerateText({ ...request, model, maxRetries: 0 });
}

export function createAiClient(env: ServerEnv = serverEnv, deps: AiClientDeps = defaultDeps): AiClient {
  const apiKey = env.AI_PROVIDER === "anthropic" ? env.ANTHROPIC_API_KEY : env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiProviderError({ reason: "not_configured", operation: "resolveModel", retryable: false });
  }

  const model = deps.resolveModel({ provider: env.AI_PROVIDER, model: env.AI_MODEL, apiKey });

  return {
    provider: env.AI_PROVIDER,
    model: env.AI_MODEL,
    async generateStep(input, options) {
      const request = {
        system: input.system,
        messages: toSdkMessages(input.messages),
        tools: toSdkTools(input.tools),
        ...(input.outputJsonSchema === undefined
          ? {}
          : {
              output: Output.object({ schema: jsonSchema(asJsonSchema(input.outputJsonSchema)) }),
              providerOptions: OPENAI_PROVIDER_OPTIONS,
            }),
        abortSignal: AbortSignal.timeout(options.timeoutMs),
      };

      try {
        const result = await callModel(model, request, deps.generateText);
        return mapResult(result);
      } catch (error) {
        if (NoObjectGeneratedError.isInstance(error)) {
          if (error.finishReason === "content-filter") {
            throw fromSdkError(error, "generateStep");
          }
          return { kind: "final", output: error.text, usage: toUsage(error.usage) };
        }

        if (error instanceof AiProviderError) throw error;
        throw fromSdkError(error, "generateStep");
      }
    },
  };
}
