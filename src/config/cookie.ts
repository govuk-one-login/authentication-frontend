import type { CookieOptions } from "csurf";

export function getCSRFCookieOptions(isProdEnv: boolean): CookieOptions {
  return {
    httpOnly: isProdEnv,
    secure: isProdEnv,
  };
}
