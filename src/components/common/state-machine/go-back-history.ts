import type { Request, Response } from "express";
import type { AuthState } from "./state-machine.js";

export function getGoBackHistoryForTransition(
  req: Request,
  res: Response,
  currentState: string,
  nextState: AuthState
): string[] {
  const isReversibleTransition =
    (nextState.transitions.length > 0 &&
      nextState.transitions.every((t) => t.meta?.reversible === true)) ??
    false;
  const passkeysEnabled =
    res.locals.supportPasskeyRegistration || res.locals.supportPasskeyUsage;
  return buildGoBackHistoryForTransition(
    req.session.user?.journey?.goBackHistory ?? [],
    passkeysEnabled,
    currentState,
    isReversibleTransition
  );
}

export function buildGoBackHistoryForTransition(
  currentGoBackHistory: string[],
  passkeysEnabled: boolean,
  previousState: string,
  isReversibleTransition: boolean
): string[] {
  if (!passkeysEnabled || !isReversibleTransition) {
    return currentGoBackHistory;
  }

  return [...currentGoBackHistory, previousState];
}
