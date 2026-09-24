import type { Request, Response } from "express";
import type { AuthState } from "./state-machine.js";
import { PATH_NAMES } from "../../../app.constants.js";

// Paths that support using goBackHistory to navigate back to the previous page
export const goBackHistoryAllowList = [
  PATH_NAMES.ENTER_PASSWORD,
  PATH_NAMES.SIGN_IN_WITH_PASSKEY,
  PATH_NAMES.RESET_PASSWORD_RESEND_CODE_2FA_SMS,
];

export function getGoBackHistoryForTransition(
  req: Request,
  res: Response,
  previousState: string,
  nextState: AuthState
): string[] {
  if (shouldClearGoBackHistory(nextState)) {
    return [];
  }

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

// NOTE: `clearGoBackHistory` is a temporary requirement whilst we're migrating
//  over to goBackHistory. Eventually, any transition that isn't marked as
//  `reversible` in the state machine should cause this effect.
function shouldClearGoBackHistory(nextState: AuthState) {
  return nextState.transitions.some((t) => t.meta?.clearGoBackHistory === true);
}

function isReversibleTransition(nextState: AuthState) {
  return (
    (nextState.transitions.length > 0 &&
      nextState.transitions.every((t) => t.meta?.reversible === true)) ??
    false
  );
}
