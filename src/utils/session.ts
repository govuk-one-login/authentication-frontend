import { UserSession } from "../types";

export function createSession(id: string, scope: string): UserSession {
  return {
    id,
    scope,
  };
}

export function isSessionValid(session: UserSession): boolean {
  return (
    session != null && Object.keys(session).length > 0 && hasValues(session)
  );
}

function hasValues(obj: UserSession) {
  return Object.values(obj).some((v) => v !== null && typeof v !== "undefined");
}
