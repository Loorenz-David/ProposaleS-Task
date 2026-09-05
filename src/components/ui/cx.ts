/** Joins class names, skipping falsy values. Keeps className composition dependency-free. */
export function cx(...parts: Array<string | false | null | undefined>): string {
    return parts.filter(Boolean).join(" ");
}
