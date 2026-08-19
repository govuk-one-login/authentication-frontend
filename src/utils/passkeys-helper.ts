import type { Request, Response } from "express";
import {
  getPasskeyRolloutPercentage,
  getPasskeyPromptClientDenyList,
} from "../config.js";

export function shouldPromptToRegisterPasskey(
  req: Request,
  res: Response
): boolean {
  const { user } = req.session;
  const userHasActivePasskeyOrUnknown = user?.hasActivePasskey !== false;

  if (!res.locals.supportPasskeyRegistration) {
    req.log.info("Passkey registration not enabled, skipping passkey prompt");
    return false;
  }
  if (!user.isInPasskeyPhasedRollout) {
    req.log.info("User not in passkey phased rollout, skipping passkey prompt");
    return false;
  }
  if (!user?.browserSupportsWebAuthn) {
    req.log.info(
      "Browser does not support WebAuthn, cannot register a passkey, skipping passkey prompt"
    );
    return false;
  }
  if (userHasActivePasskeyOrUnknown) {
    req.log.info(
      "User already has a passkey, or it cannot be determined, skipping passkey prompt"
    );
    return false;
  }
  if (user.hasSkippedPasskeyRegistration) {
    req.log.info(
      "User has already skipped passkey registration, skipping passkey prompt"
    );
    return false;
  }
  if (user.backendIndicatesPasskeyPromptShouldBeSkipped) {
    req.log.info(
      "Backend indicated the passkey prompt should be skipped, skipping passkey prompt"
    );
    return false;
  }
  if (user.reauthenticate) {
    req.log.info("User is reauthenticating, skipping passkey prompt");
    return false;
  }
  if (userHasBeenOnPasswordResetJourney(req)) {
    req.log.info(
      "User has been on a password reset journey, skipping passkey prompt"
    );
    return false;
  }
  if (!isPromptableRPClientID(req.session.client.rpClientId)) {
    req.log.info(
      "Relying party is on the passkey prompt deny list, skipping passkey prompt"
    );
    return false;
  }
  if (!userHasLoggedInWithPasswordAnd2Fa(req)) {
    req.log.info(
      "User has not signed in with a password and 2FA, skipping passkey prompt"
    );
    return false;
  }
  if (user.accountInterventionAppliedDuringPasskeyRegistration) {
    req.log.info(
      "Account intervention applied during passkey registration, skipping passkey prompt"
    );
    return false;
  }

  req.log.info("Prompting passkey registration");
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

export function isInPasskeyPhasedRollout(req: Request): boolean {
  const passkeyRolloutPercentage = getPasskeyRolloutPercentage();

  if (!passkeyRolloutPercentage) {
    req.log.info("No passkey rollout percentage configured");
    return false;
  }

  const randomPercentage = Math.random() * 100;
  return randomPercentage <= passkeyRolloutPercentage;
}

function isPromptableRPClientID(rpClientId: string) {
  return !getPasskeyPromptClientDenyList().includes(rpClientId);
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
