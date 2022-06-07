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
  errorDescription: string
): string {
  const redirect = new URL(redirectUri);
  const params = {
    error: error,
    error_description: errorDescription,
  };

  return (
    redirect +
    "?" +
    Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join("&")
  );
}
