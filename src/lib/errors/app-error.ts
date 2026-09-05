export const ERROR_CODES = [
  "validation_error",
  "unauthenticated",
  "forbidden",
  "not_found",
  "conflict",
  "approval_required",
  "integration_error",
  "rate_limited",
  "internal_error",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export type ValidationReason =
  | "model_output_invalid"
  | "workflow_state_too_large"
  | "unknown_question_id"
  | "pricing_acknowledgment_missing"
  | "required_to_create_unresolved"
  | "consequential_provenance_invalid"
  | "domain_rule";

export type ConflictReason = "draft_already_exists" | "multiple_recovery_matches";

export type ErrorIssue = { path: string[]; message: string };

type ErrorOptions = {
  message?: string;
  details?: Record<string, unknown>;
  cause?: unknown;
};

export abstract class AppError extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly httpStatus: number;
  readonly details?: Record<string, unknown>;
  readonly cause?: unknown;

  protected constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.name = new.target.name;
    this.details = options.details;
    this.cause = options.cause;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export type ValidationErrorOptions = {
  message?: string;
  reason?: ValidationReason;
  issues?: ErrorIssue[];
  cause?: unknown;
  [key: string]: unknown;
};

export class ValidationError extends AppError {
  readonly code = "validation_error" as const;
  readonly httpStatus = 400 as const;

  constructor(options: ValidationErrorOptions = {}) {
    const { message = "Validation failed", reason, issues, cause, ...details } = options;
    super(message, {
      cause,
      details: {
        ...details,
        ...(reason === undefined ? {} : { reason }),
        ...(issues === undefined ? {} : { issues }),
      },
    });
  }
}

export type ConflictErrorOptions = ErrorOptions & { reason?: ConflictReason };

export class AuthenticationError extends AppError {
  readonly code = "unauthenticated" as const;
  readonly httpStatus = 401 as const;

  constructor(options: ErrorOptions = {}) {
    super(options.message ?? "Authentication required", options);
  }
}

export class AuthorizationError extends AppError {
  readonly code = "forbidden" as const;
  readonly httpStatus = 403 as const;

  constructor(options: ErrorOptions = {}) {
    super(options.message ?? "You are not authorized to perform this action", options);
  }
}

export class NotFoundError extends AppError {
  readonly code = "not_found" as const;
  readonly httpStatus = 404 as const;

  constructor(options: ErrorOptions = {}) {
    super(options.message ?? "Resource not found", options);
  }
}

export class ConflictError extends AppError {
  readonly code = "conflict" as const;
  readonly httpStatus = 409 as const;

  constructor(options: ConflictErrorOptions = {}) {
    const { reason, ...baseOptions } = options;
    super(baseOptions.message ?? "The requested operation conflicts with the current state", {
      ...baseOptions,
      details: reason === undefined ? baseOptions.details : { ...baseOptions.details, reason },
    });
  }
}

export class ApprovalRequiredError extends AppError {
  readonly code = "approval_required" as const;
  readonly httpStatus = 409 as const;

  constructor(options: ErrorOptions = {}) {
    super(options.message ?? "Human approval is required", options);
  }
}

export type IntegrationErrorOptions = {
  system: string;
  status?: number;
  retryable: boolean;
  reason?: string;
  operation?: string;
  message?: string;
  cause?: unknown;
};

export class IntegrationError extends AppError {
  readonly code = "integration_error" as const;
  readonly httpStatus = 502 as const;

  constructor(options: IntegrationErrorOptions) {
    const { system, status, retryable, reason, operation, message = "An external system failed", cause } = options;
    super(message, {
      cause,
      details: {
        system,
        ...(status === undefined ? {} : { status }),
        retryable,
        ...(reason === undefined ? {} : { reason }),
        ...(operation === undefined ? {} : { operation }),
      },
    });
  }
}

export class RateLimitedError extends AppError {
  readonly code = "rate_limited" as const;
  readonly httpStatus = 429 as const;

  constructor(options: ErrorOptions = {}) {
    super(options.message ?? "Too many requests", options);
  }
}

export class InternalError extends AppError {
  readonly code = "internal_error" as const;
  readonly httpStatus = 500 as const;

  constructor(options: ErrorOptions = {}) {
    super(options.message ?? "An unexpected error occurred.", options);
  }
}
