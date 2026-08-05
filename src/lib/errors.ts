export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: ApiFieldError[] | null;
}

export class ApiRequestError extends Error {
  readonly status: number;
  readonly details: ApiFieldError[] | null;

  constructor(message: string, status: number, details?: ApiFieldError[] | null) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.details = details ?? null;
  }
}

export function isApiRequestError(error: unknown): error is ApiRequestError {
  return error instanceof ApiRequestError;
}

export function parseApiError(error: unknown): ApiError {
  if (isApiRequestError(error)) {
    return {
      message: error.message,
      status: error.status,
      details: error.details,
    };
  }
  if (error instanceof Error) {
    return { message: error.message, status: 0, details: null };
  }
  return { message: "An unknown error occurred", status: 0, details: null };
}

export function getFieldError(
  details: ApiFieldError[] | null | undefined,
  field: string
): string | null {
  return details?.find((d) => d.field === field)?.message ?? null;
}
