import "express-session";
import type { UserSessionClient } from "../../src/types.js";
declare module "express-session" {
  import type { UserSession } from "../../src/types.ts";

  interface SessionData {
    user: UserSession;
    client: UserSessionClient;
    sessionRestored?: boolean;
  }
}
