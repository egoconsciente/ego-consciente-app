type SafeScalar = string | number | boolean | null | undefined;
type SafeValue = SafeScalar | readonly SafeScalar[];
export type SafeClientMetadata = Record<string, SafeValue>;

const MAX_STRING_LENGTH = 160;
const MAX_ARRAY_ITEMS = 12;

function normalizeValue(value: SafeValue): SafeValue {
  if (typeof value === "string") {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}…`
      : value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, MAX_ARRAY_ITEMS).map((item) =>
      typeof item === "string" && item.length > MAX_STRING_LENGTH
        ? `${item.slice(0, MAX_STRING_LENGTH)}…`
        : item,
    );
  }

  return value;
}

function normalizeMetadata(metadata: SafeClientMetadata): SafeClientMetadata {
  return Object.fromEntries(
    Object.entries(metadata)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, normalizeValue(value)]),
  );
}

function errorMetadata(error: unknown): SafeClientMetadata {
  if (!error || typeof error !== "object") {
    return { errorType: typeof error };
  }

  const candidate = error as {
    name?: unknown;
    message?: unknown;
    code?: unknown;
    status?: unknown;
  };

  return {
    errorName:
      typeof candidate.name === "string" ? candidate.name : "UnknownError",
    hasErrorMessage: typeof candidate.message === "string",
    errorCode:
      typeof candidate.code === "string" || typeof candidate.code === "number"
        ? String(candidate.code)
        : undefined,
    errorStatus:
      typeof candidate.status === "string" || typeof candidate.status === "number"
        ? String(candidate.status)
        : undefined,
  };
}

/**
 * Development-only client diagnostics.
 *
 * Never pass user-authored text, P-E-A answers, chat content, onboarding
 * responses, complete payloads, access tokens, email addresses or user IDs.
 * Production telemetry must use a dedicated, consent-aware service instead.
 */
export function reportClientEvent(
  event: string,
  metadata: SafeClientMetadata = {},
): void {
  if (!import.meta.env.DEV) return;
  console.info(`[EC] ${event}`, normalizeMetadata(metadata));
}

export function reportClientWarning(
  event: string,
  metadata: SafeClientMetadata = {},
): void {
  if (!import.meta.env.DEV) return;
  console.warn(`[EC] ${event}`, normalizeMetadata(metadata));
}

export function reportClientError(
  event: string,
  error?: unknown,
  metadata: SafeClientMetadata = {},
): void {
  if (!import.meta.env.DEV) return;
  console.error(
    `[EC] ${event}`,
    normalizeMetadata({ ...metadata, ...errorMetadata(error) }),
  );
}
