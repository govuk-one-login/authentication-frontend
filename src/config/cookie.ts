import CookieSessionOptions = CookieSessionInterfaces.CookieSessionOptions;
import { CookieOptions } from "csurf";

export function getSessionCookieOptions(
  isProdEnv: boolean,
  expiry: number,
  secret: string
): CookieSessionOptions {
  return {
    name: "aps",
    secret: secret,
    maxAge: expiry,
    secure: isProdEnv,
  };
}

export function getCSRFCookieOptions(isProdEnv: boolean): CookieOptions {
  return {
    httpOnly: isProdEnv,
    secure: isProdEnv,
  };
}
