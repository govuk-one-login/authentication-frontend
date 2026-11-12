import type { CredentialStrength } from "./constants.js";
import { MfaMethodType } from "./constants.js";
import type { StubbedApiResponses } from "./stubbed-api-responses.js";

export interface State {
  authenticated: boolean;
  authenticatedCredentialStrength: CredentialStrength | "";
  credentialStrength: CredentialStrength | "";
  userMfaMethodType: MfaMethodType;
  registered: Record<string, boolean>;
  stubbedApiResponses: StubbedApiResponses;
}

export const state: State = createFreshState();

function createFreshState(): State {
  return {
    authenticated: false,
    authenticatedCredentialStrength: "",
    credentialStrength: "",
    userMfaMethodType: MfaMethodType.SMS,
    registered: {},
    stubbedApiResponses: {},
  };
}

export function resetState(): void {
  Object.assign(state, createFreshState());
}
