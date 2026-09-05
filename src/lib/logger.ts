import "server-only";

export const REDACTED_KEYS = ["authorization", "apikey", "api_key", "token", "password", "secret", "email"] as const;

const REDACTED_KEY_SET = new Set<string>(REDACTED_KEYS);
const UNSERIALIZABLE = "[unserializable]";
const REDACTED = "[redacted]";

type Sink = (line: string) => unknown;

export type LoggerOptions = {
  sink?: Sink;
  now?: () => Date;
};

export type Logger = {
  info: (event: string, fields?: Record<string, unknown>) => void;
  warn: (event: string, fields?: Record<string, unknown>) => void;
  error: (event: string, fields?: Record<string, unknown>) => void;
};

function isPlainObject(value: object): boolean {
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function redact(value: unknown, ancestors: Set<object>): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number") return Number.isFinite(value) ? value : UNSERIALIZABLE;
  if (typeof value !== "object") return UNSERIALIZABLE;
  if (ancestors.has(value)) return UNSERIALIZABLE;

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      return Array.from({ length: value.length }, (_, index) => redact(value[index], ancestors));
    }

    if (!isPlainObject(value)) return UNSERIALIZABLE;

    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || !("value" in descriptor)) {
        result[key] = UNSERIALIZABLE;
      } else if (REDACTED_KEY_SET.has(key.toLowerCase())) {
        result[key] = REDACTED;
      } else {
        result[key] = redact(descriptor.value, ancestors);
      }
    }
    return result;
  } catch {
    return UNSERIALIZABLE;
  } finally {
    ancestors.delete(value);
  }
}

export function createLogger({
  sink = process.stdout.write.bind(process.stdout),
  now = () => new Date(),
}: LoggerOptions = {}): Logger {
  function write(level: "info" | "warn" | "error", event: string, fields?: Record<string, unknown>): void {
    const sanitizedFields = redact(fields ?? {}, new Set()) as Record<string, unknown>;
    const record = {
      ...sanitizedFields,
      level,
      event,
      time: now().toISOString(),
    };
    sink(`${JSON.stringify(record)}\n`);
  }

  return {
    info: (event, fields) => write("info", event, fields),
    warn: (event, fields) => write("warn", event, fields),
    error: (event, fields) => write("error", event, fields),
  };
}
