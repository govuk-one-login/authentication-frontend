import "express-session";
import type { UserSessionClient } from "../../src/types.js";
import type { UserSession } from "../../src/types.ts";

declare module "express-session" {
  interface SessionData {
    user: UserSession;
    client: UserSessionClient;
    sessionRestored?: boolean;
  }
}
