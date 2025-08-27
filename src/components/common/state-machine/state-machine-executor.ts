import type { Request, Response } from "express";
import {
  authStateMachine,
  getNextState,
  type AuthStateContext,
} from "./state-machine.js";
import { saveSessionState } from "../constants.js";
import { isAccountRecoveryJourneyAndPermitted } from "../../../utils/request.js";

export async function getNextPathAndUpdateJourney(
  req: Request,
  res: Response,
  event: string,
  ctx?: AuthStateContext
): Promise<string> {
  const sessionId = res.locals.sessionId;
  const currentState = req.path;

  const context = {
    isAccountRecoveryJourney: isAccountRecoveryJourneyAndPermitted(req),
    isIdentityRequired: !!req.session.user?.isIdentityRequired,
    isLatestTermsAndConditionsAccepted: !!req.session.user?.isLatestTermsAndConditionsAccepted,
    isMfaRequired: !!req.session.user?.isMfaRequired,
    isPasswordChangeRequired: !!req.session.user?.isPasswordChangeRequired,
    isPasswordResetJourney: !!req.session.user?.isPasswordResetJourney,
    isOnForcedPasswordResetJourney: !!req.session.user?.withinForcedPasswordResetJourney,
    mfaMethodType: req.session.user?.mfaMethodType,
    ...ctx,
  }

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
    `User journey transitioned from ${currentState} to ${nextState.value} with session id ${sessionId}`
  );

  // If an invalid/unexpected event is supplied Stately will return the same state, likely indicating a bug
  if (currentState === nextState.value) {
    req.log.warn(
      `Invalid user journey. Transition from ${currentState} with event ${event} with sessionId ${sessionId}`
    );
  }

  return nextState.value;
}
