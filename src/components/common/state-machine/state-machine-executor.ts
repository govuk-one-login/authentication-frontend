import type { Request, Response } from "express";
import {
  authStateMachine,
  getNextState,
  type AuthStateContext,
} from "./state-machine.js";
import { saveSessionState } from "../constants.js";
import {
  shouldPromptToRegisterPasskey,
  shouldPromptToSignInWithPasskey,
} from "../../../utils/passkeys-helper.js";

const pathsToIgnore = [
  '/reset-password-request'
]

export async function getNextPathAndUpdateJourney(
  req: Request,
  res: Response,
  event: string,
  currentStateOverride?: string
): Promise<string> {
  const sessionId = res.locals.sessionId;
  const currentState = currentStateOverride ? currentStateOverride : req.path;
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
    mfaMethodType: req.session.user?.mfaMethodType,
    shouldPromptToRegisterPasskey: shouldPromptToRegisterPasskey(req, res),
    shouldPromptToSignInWithPasskey: shouldPromptToSignInWithPasskey(req, res),
  };

  const nextState = getNextState(currentState, event, context);

  const isTransitionReversible = authStateMachine.states[currentState].on[event][0]?.meta?.reversible ?? true

  const getGoBackHistory = () => {
    const ignorePath = pathsToIgnore.includes(currentState)

    if (ignorePath) {
      return [...req.session.user.journey?.goBackHistory ?? []]
    }

    return isTransitionReversible ? [...req.session.user.journey?.goBackHistory ?? [], currentState] : []
  }

  req.session.user.journey = {
    previousPath: currentState,
    nextPath: nextState.value,
    optionalPaths:
      Object.keys(nextState.meta).length > 0
        ? nextState.meta[`${authStateMachine.id}.${nextState.value}`]
            .optionalPaths
        : [],
    goBackHistory: getGoBackHistory()
  };

  await saveSessionState(req);

  req.log.info(
    {
      personalLog: isTransitionReversible,
      someEventThing: authStateMachine.states[currentState].on[event],
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
