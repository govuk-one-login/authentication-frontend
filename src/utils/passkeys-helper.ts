import type { Request, Response } from "express";
import {
  getPasskeyPromptClientAllowList,
  getPasskeyRolloutPercentage,
  getPasskeyPromptClientDenyList,
} from "../config.js";

export function shouldPromptToRegisterPasskey(
  req: Request,
  res: Response
): boolean {
  const { user } = req.session;
  const userHasActivePasskeyOrUnknown = user?.hasActivePasskey !== false;

  if (!res.locals.supportPasskeyRegistration) return false;
  req.log.info("!supportPasskeyRegistration=true");
  if (!user.isInPasskeyPhasedRollout) return false;
  req.log.info("!isInPasskeyPhasedRollout=true");
  if (!user?.browserSupportsWebAuthn) return false;
  req.log.info("browserSupportsWebAuthn=true");
  if (userHasActivePasskeyOrUnknown) return false;
  req.log.info("userHasActivePasskeyOrUnknown=true");
  if (user.hasSkippedPasskeyRegistration) return false;
  req.log.info("hasSkippedPasskeyRegistration=true");
  if (user.backendIndicatesPasskeyPromptShouldBeSkipped) return false;
  req.log.info("backendIndicatesPasskeyPromptShouldBeSkipped=true");
  if (user.reauthenticate) return false;
  req.log.info("reauthenticate=true");
  if (userHasBeenOnPasswordResetJourney(req)) return false;
  req.log.info("userHasBeenOnPasswordResetJourney=true");
  if (!isPromptableRPClientID(req.session.client.rpClientId)) return false;
  req.log.info("!isPromptableRPClientID=true");
  if (!userHasLoggedInWithPasswordAnd2Fa(req)) return false;
  req.log.info("userHasLoggedInWithPasswordAnd2Fa=true");
  if (user.accountInterventionAppliedDuringPasskeyRegistration) return false;
  req.log.info("!accountInterventionAppliedDuringPasskeyRegistration=true");
  req.log.info("shouldPromptToRegisterPasskey=true");
  return true;
}

export function shouldPromptToSignInWithPasskey(
  req: Request,
  res: Response
): boolean {
  return (
    req.session.user?.browserSupportsWebAuthn === true &&
    req.session.user?.hasActivePasskey === true &&
    res.locals.supportPasskeyUsage === true
  );
}

export function isInPasskeyPhasedRollout(): boolean {
  const passkeyRolloutPercentage = getPasskeyRolloutPercentage();

  if (!passkeyRolloutPercentage) return false;

  const randomPercentage = Math.random() * 100;
  return randomPercentage <= passkeyRolloutPercentage;
}

function isPromptableRPClientID(rpClientId: string) {
  return (
    getPasskeyPromptClientAllowList().includes(rpClientId) &&
    !getPasskeyPromptClientDenyList().includes(rpClientId)
  );
}

function userHasBeenOnPasswordResetJourney(req: Request) {
  return (
    req.session.user?.isPasswordResetJourney ||
    req.session.user?.withinForcedPasswordResetJourney ||
    req.session.user?.isCommonPasswordResetJourney
  );
}

function userHasLoggedInWithPasswordAnd2Fa(req: Request) {
  return req.session.user?.isMfaRequired && !req.session.user?.isUpliftRequired;
}
