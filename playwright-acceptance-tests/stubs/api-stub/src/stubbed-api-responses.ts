import type { StartResponse } from "./responses/start-response.type.js";
import type { UserExistsResponse } from "./responses/user-exists-response.type.js";

export interface StubbedApiResponses {
  startResponse?: StartResponse;
  loginResponse?: object;
  userExistsResponse?: UserExistsResponse;
  signUpResponse?: object;
  mfaResponse?: object;
  verifyCodeResponse?: object;
  verifyMfaCodeResponse?: object;
  authenticationAuthCodeResponse?: object;
  accountInterventionsResponse?: object;
}
