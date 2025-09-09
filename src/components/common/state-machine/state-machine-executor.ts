import type { Request, Response } from "express";
import {
  authStateMachine,
  getNextState,
  type AuthStateContext,
} from "./state-machine.js";
import { saveSessionState } from "../constants.js";

export async function getNextPathAndUpdateJourney(
  req: Request,
  res: Response,
  event: string
): Promise<string> {
  const sessionId = res.locals.sessionId;
  const currentState = req.path;
  const sessionState = req.session.user?.journey?.nextPath;

  const context: AuthStateContext = {
    isAccountPartCreated: !!req.session.user?.isAccountPartCreated,
    isAccountRecoveryJourney: !!req.session.user?.isAccountRecoveryJourney,
    isIdentityRequired: !!req.session.user?.isIdentityRequired,
    isLatestTermsAndConditionsAccepted:
      req.session.user?.isLatestTermsAndConditionsAccepted ?? true,
    isMfaRequired: !!req.session.user?.isMfaRequired,
    isOnForcedPasswordResetJourney:
      !!req.session.user?.withinForcedPasswordResetJourney,
    isPasswordChangeRequired: !!req.session.user?.isPasswordChangeRequired,
    isPasswordResetJourney: !!req.session.user?.isPasswordResetJourney,
    // TODO: Consolidate to just mfaMethodType in follow-up PR
    mfaMethodType:
      req.session.user?.mfaMethodType ?? req.session.user?.enterEmailMfaType,
  };

  const nextState = getNextState(currentState, event, context);

  req.session.user.journey = {
    nextPath: nextState.value,
    optionalPaths:
      Object.keys(nextState.meta).length > 0
        ? nextState.meta[`${authStateMachine.id}.${nextState.value}`]
            .optionalPaths
        : [],
  };

  await saveSessionState(req);

  req.log.info(
    {
      transition: {
        from: currentState,
        to: nextState.value,
        event: event,
        sessionState,
      },
      sessionId,
    },
    `User journey transition`
  );

  // If an invalid/unexpected event is supplied Stately will return the same state, likely indicating a bug
  if (currentState === nextState.value) {
    req.log.warn(
      `Invalid user journey. Transition from ${currentState} with event ${event} with sessionId ${sessionId}`
    );
  }

  return nextState.value;
}
