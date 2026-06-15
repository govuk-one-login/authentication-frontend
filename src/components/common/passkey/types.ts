import type { Request } from "express";
import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";

export interface StartPasskeyAssertionResponse extends DefaultApiResponse {
  publicKey: PublicKeyCredentialRequestOptionsJSON;
}

export interface PasskeyServiceInterface {
  startPasskeyAssertion: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request
  ) => Promise<ApiResponseResult<StartPasskeyAssertionResponse>>;
  finishPasskeyAssertion: (
    sessionId: string,
    clientSessionId: string,
    persistentSessionId: string,
    req: Request,
    authenticationResponse: AuthenticationResponseJSON
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}
