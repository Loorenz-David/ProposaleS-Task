import "server-only";

import { getAiClient } from "@/lib/ai";
import { serverEnv } from "@/lib/env/server";
import { createLogger } from "@/lib/logger";
import { getProposalesClient } from "@/lib/proposales";

/**
 * The one place a service's collaborators are constructed. Every lazily-built dependency is a
 * getter, so importing a service constructs no client and reads no configuration; every clock and
 * id generator is a function, so no service or domain module calls `Date.now` or
 * `crypto.randomUUID` inline (§9.1 rule 4). Tests pass their own object and never reach this.
 */
export const defaultDeps = {
  get proposales() {
    return getProposalesClient();
  },
  get ai() {
    return getAiClient();
  },
  get editorOrigin() {
    return serverEnv.PROPOSALES_EDITOR_ORIGIN;
  },
  get logger() {
    return createLogger();
  },
  now: () => Date.now(),
  newGenerationId: () => crypto.randomUUID(),
  newQuestionId: () => crypto.randomUUID(),
  newTurnId: () => crypto.randomUUID(),
  newRunId: () => crypto.randomUUID(),
};
