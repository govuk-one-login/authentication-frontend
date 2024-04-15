import { CookieOptions } from "csurf";

export function getCSRFCookieOptions(isProdEnv: boolean): CookieOptions {
  return {
    httpOnly: isProdEnv,
    secure: isProdEnv,
  };
}

// TODO: decide what to do with this
