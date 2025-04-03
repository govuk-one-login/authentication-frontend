import "express-session";
import { UserSessionClient } from "../../src/types";

declare module "express-session" {
  import { UserSession } from "../../src/types";

  interface SessionData {
    user: UserSession;
    client: UserSessionClient;
    sessionRestored?: boolean;
  }
}
