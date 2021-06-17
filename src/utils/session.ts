import { UserSession } from "../types/user-session";

export function createSession(sessionId: any, scope: any): UserSession {
  return {
    sessionId,
    scope,
  };
}

  export function isSessionValid(session: UserSession): boolean {
  return session && Object.keys(session).length > 0 && hasValues(session);
}

function hasValues(obj: UserSession) {
  return Object.values(obj).some(v => v !== null && typeof v !== "undefined");
}
