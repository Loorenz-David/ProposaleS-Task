export class OfflineGuardError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OfflineGuardError";
  }
}

process.env.PROPOSALES_API_KEY = "test-placeholder-not-a-key";
process.env.PROPOSALES_COMPANY_ID = "1";
process.env.PROPOSALES_EDITOR_ORIGIN = "https://proposales.test";
process.env.AI_PROVIDER = "anthropic";
process.env.AI_MODEL = "test-placeholder-model";
process.env.ANTHROPIC_API_KEY = "test-placeholder-not-a-key";
process.env.OPENAI_API_KEY = "test-placeholder-not-a-key";

export function installOfflineFetchGuard() {
  globalThis.fetch = async () => {
    throw new OfflineGuardError("network access is not allowed in the default suite");
  };
}

if (typeof window === "undefined") {
  installOfflineFetchGuard();
}
