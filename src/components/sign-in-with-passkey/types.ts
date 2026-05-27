import type { Request } from "express";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";

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
