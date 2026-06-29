import type { CredentialStrength, MfaLockReason } from "./constants.js";
import { MfaMethodType } from "./constants.js";

export interface State {
  loginAttempts: Record<string, number>;
  lockedOutPassword: Record<string, boolean>;
  lockedOutMfa: Record<string, MfaLockReason>;
  mfaResendCount: number;
  verifyMfaAttempts: number;
  verifyCodeAttempts: number;
  authenticated: boolean;
  authenticatedCredentialStrength: CredentialStrength | "";
  credentialStrength: CredentialStrength | "";
  userMfaMethodType: MfaMethodType;
  registered: Record<string, boolean>;
}

export const state: State = createFreshState();

function createFreshState(): State {
  return {
    loginAttempts: {},
    lockedOutPassword: {},
    lockedOutMfa: {},
    mfaResendCount: 0,
    verifyMfaAttempts: 0,
    verifyCodeAttempts: 0,
    authenticated: false,
    authenticatedCredentialStrength: "",
    credentialStrength: "",
    userMfaMethodType: MfaMethodType.SMS,
    registered: {},
  };
}

export function resetState(): void {
  Object.assign(state, createFreshState());
}
