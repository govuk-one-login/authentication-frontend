import "express-session";
import { UserSessionClient } from "../../src/types.js";

declare module "express-session" {
  import { UserSession } from "../../src/types.js";

  interface SessionData {
    user: UserSession;
    client: UserSessionClient;
  }
}
