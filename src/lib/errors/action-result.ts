import { toErrorDto, type ErrorDto } from "@/lib/errors/error-dto";

/**
 * What a Server Action returns. Expected failures cross the boundary as data, never as a thrown
 * error: a thrown `AppError` would arrive in the browser as a plain `Error` with its class, its
 * `code` and its `details` gone (02 §6, 04 §6).
 *
 * Runtime-neutral on purpose. The client imports this module for the type and for nothing else,
 * so it carries no `server-only` and reads no environment.
 */
export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ErrorDto };

/**
 * Runs one service call and converts anything it throws into an `ErrorDto`. `onError` is where the
 * transport logs the failure once (10 §7); it is called with the original error, so the caller can
 * read `code` and `details` from it, and it never sees a return value that could change the result.
 */
export async function toActionResult<T>(
  run: () => Promise<T>,
  onError?: (error: unknown) => void,
): Promise<ActionResult<T>> {
  try {
    return { ok: true, data: await run() };
  } catch (error) {
    onError?.(error);
    return { ok: false, error: toErrorDto(error) };
  }
}
