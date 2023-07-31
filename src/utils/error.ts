export class BadRequestError extends Error {
  private status: number;
  level?: string;
  constructor(message: string, code: number | string) {
    super(`${code}:${message}`);
    this.status = 400;
  }
}

export class ApiError extends Error {
  private status?: number;
  private data?: string;
  constructor(message: string, status?: number, data?: string) {
    super(message);
    this.data = data;
    this.status = status;
  }
}

export class DecryptionError extends Error {
  cause: Error | undefined;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "DecryptionError";
    this.cause = cause;
  }
}

export class JwtSignatureVerificationError extends Error {
  cause: Error | undefined;

  constructor(message: string, cause?: Error) {
    super(message);
    this.name = "JwtSignatureVerificationError";
    this.cause = cause;
  }
}

export class InvalidBase64Error extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidBase64Error";
  }
}

export class JwtPayloadParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "JwtPayloadParseError";
  }
}

export class QueryParamsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QueryParamsError";
  }
}

export class ClaimsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClaimsError";
  }
}

export class ErrorWithLevel extends Error {
  level: string;
  constructor(message: string, level: string) {
    super(message);
    this.level = level;
  }
}

export function createServiceRedirectErrorUrl(
  redirectUri: string,
  error: string,
  errorDescription: string,
  state: string
): string {
  const redirect = new URL(redirectUri);
  const params = {
    error: error,
    error_description: errorDescription,
    state: state,
  };

  return (
    redirect +
    "?" +
    Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")
  );
}
