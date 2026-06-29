import type { Request, Response } from "express";
import { CredentialStrength, MfaMethodType } from "../constants.js";
import { state } from "../state.js";

interface StartRequest {
  requested_credential_strength?: CredentialStrength;
  authenticated?: boolean;
}

export function startHandler(req: Request, res: Response): void {
  const { requested_credential_strength, authenticated } =
    req.body as StartRequest;
  const credStrength =
    requested_credential_strength || CredentialStrength.PASSWORD_AND_MFA;
  const mfaRequired = credStrength !== CredentialStrength.PASSWORD_ONLY;

  if (requested_credential_strength) {
    state.credentialStrength = requested_credential_strength;
  }

  const needsUplift =
    state.authenticated &&
    authenticated &&
    mfaRequired &&
    state.authenticatedCredentialStrength === CredentialStrength.PASSWORD_ONLY;

  res.json({
    sessionId: "session-123",
    user: {
      upliftRequired: needsUplift,
      identityRequired: false,
      authenticated: state.authenticated,
      mfaMethodType: state.authenticated
        ? state.userMfaMethodType
        : MfaMethodType.SMS,
      mfaRequired: needsUplift || (!state.authenticated && mfaRequired),
      isBlockedForReauth: false,
    },
    featureFlags: {},
  });
}
