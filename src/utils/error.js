export class BadRequestError extends Error {
    status;
    level;
    constructor(message, code) {
        super(code ? `${code}:${message}` : `${message}`);
        this.status = 400;
    }
}
export class ApiError extends Error {
    status;
    data;
    constructor(message, status, data) {
        super(message);
        this.data = data;
        this.status = status;
    }
}
export class DecryptionError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.name = "DecryptionError";
        this.cause = cause;
    }
}
export class JwtValidationError extends Error {
    cause;
    constructor(message, cause) {
        super(message);
        this.name = "JwtValidationError";
        this.cause = cause;
    }
}
export class InvalidBase64Error extends Error {
    constructor(message) {
        super(message);
        this.name = "InvalidBase64Error";
    }
}
export class ReauthJourneyError extends Error {
    constructor(message) {
        super(message);
        this.name = "ReauthJourneyError";
    }
}
export class QueryParamsError extends Error {
    constructor(message) {
        super(message);
        this.name = "QueryParamsError";
    }
}
export class JwtClaimsValueError extends Error {
    constructor(message) {
        super(message);
        this.name = "JwtClaimsValueError";
    }
}
export class ErrorWithLevel extends Error {
    level;
    constructor(message, level) {
        super(message);
        this.level = level;
    }
}
export function createServiceRedirectErrorUrl(redirectUri, error, errorDescription, state) {
    const redirect = new URL(redirectUri);
    const params = {
        error: error,
        error_description: errorDescription,
        state: state,
    };
    return (redirect +
        "?" +
        Object.entries(params)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join("&"));
}
