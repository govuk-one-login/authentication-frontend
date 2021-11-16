declare namespace CookieSessionInterfaces {
  import { UserSession } from "../../src/types/user-session";

  interface CookieSessionObject {
    user?: UserSession;
  }
}
