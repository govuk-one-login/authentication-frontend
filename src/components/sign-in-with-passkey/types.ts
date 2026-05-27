import type { Request } from "express";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";

export interface StartSignInWithPasskeyResponse
  extends DefaultApiResponse, PublicKeyCredentialRequestOptionsJSON {}

export interface StartSignInWithPasskeyInterface {
  startSignInWithPasskey: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<StartSignInWithPasskeyResponse>>;
}

export interface FinishSignInWithPasskeyInterface {
  finishSignInWithPasskey: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    authenticationResponse: AuthenticationResponseJSON
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
