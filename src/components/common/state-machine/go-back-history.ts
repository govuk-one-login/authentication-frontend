import type { Request, Response } from "express";
import type { AuthState } from "./state-machine.js";
import { PATH_NAMES } from "../../../app.constants.js";

export const goBackHistoryAllowList = [PATH_NAMES.ENTER_PASSWORD];

export function getGoBackHistoryForTransition(
  req: Request,
  res: Response,
  previousState: string,
  nextState: AuthState
): string[] {
  const passkeysEnabled =
    res.locals.supportPasskeyRegistration || res.locals.supportPasskeyUsage;
  const currentGoBackHistory = req.session.user?.journey?.goBackHistory ?? [];

  if (!passkeysEnabled || !isReversibleTransition(nextState)) {
    return currentGoBackHistory;
  }

  return [...currentGoBackHistory, previousState];
}

export function isBackTransition(
  goBackHistory: string[],
  currentPath: string
): boolean {
  if (goBackHistory.length === 0) {
    return false;
  }

  const lastPath = goBackHistory[goBackHistory.length - 1];
  return lastPath === currentPath;
}

function isReversibleTransition(nextState: AuthState) {
  return (
    (nextState.transitions.length > 0 &&
      nextState.transitions.every((t) => t.meta?.reversible === true)) ??
    false
  );
}
