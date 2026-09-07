import "server-only";

export type LanguageResolution =
  | { kind: "resolved"; language: string }
  | { kind: "ask" };

export function resolveLanguage(candidate: string | null, catalogLanguages: string[]): LanguageResolution {
  return candidate !== null && catalogLanguages.includes(candidate)
    ? { kind: "resolved", language: candidate }
    : { kind: "ask" };
}
