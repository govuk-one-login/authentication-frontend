import type { StartResponse } from "./responses/start-response.type.js";

export interface StubbedApiResponses {
  startResponse?: StartResponse;
  loginResponse?: object;
  userExistsResponse?: object;
  signUpResponse?: object;
  mfaResponse?: object;
  verifyCodeResponse?: object;
  verifyMfaCodeResponse?: object;
  authenticationAuthCodeResponse?: object;
  accountInterventionsResponse?: object;
}
