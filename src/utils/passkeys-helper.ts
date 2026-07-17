import type { Request, Response } from "express";
import {
  getPasskeyPromptClientAllowList,
  getPasskeyRolloutPercentage,
  getPasskeyPromptClientDenyList,
} from "../config.js";
import { logger } from "./logger.js";

export function shouldPromptToRegisterPasskey(
  req: Request,
  res: Response
): boolean {
  return (
    req.session.user?.browserSupportsWebAuthn === true &&
    req.session.user?.hasActivePasskey === false &&
    req.session.user?.hasSkippedPasskeyRegistration !== true &&
    req.session.user?.backendIndicatesPasskeyPromptShouldBeSkipped !== true &&
    !req.session.user?.reauthenticate &&
    !userHasBeenOnPasswordResetJourney(req) &&
    isPromptableRPClientID(req.session.client.rpClientId) &&
    userHasLoggedInWithPasswordAnd2Fa(req) &&
    res.locals.supportPasskeyRegistration === true &&
    req.session.user.isInPasskeyPhasedRollout === true
  );
}

export function shouldPromptToSignInWithPasskey(
  req: Request,
  res: Response
): boolean {
  logger.info("BECKA checking if should prompt to sign in with passkey");
  logger.info(`BECKA browserSupportsWebAuthn is ${req.session.user?.browserSupportsWebAuthn}`)
  logger.info(`BECKA hasActivePasskey is ${req.session.user?.hasActivePasskey}`)
  logger.info(`BECKA supportPasskeyUsage is ${res.locals.supportPasskeyUsage}`)
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
