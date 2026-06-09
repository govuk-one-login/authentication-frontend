import { getDynamoSessionStore } from "./dynamodb-session.js";
import type { Store } from "express-session";

export function getSessionStore(): Store {
  return getDynamoSessionStore();
}

export function getSessionCookieOptions(
  isProdEnv: boolean,
  expiry: number,
  secret: string
): any {
  return {
    name: "aps",
    maxAge: expiry,
    secret: secret,
    signed: true,
    secure: isProdEnv,
  };
}
