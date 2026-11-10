import type { StartResponse } from "./responses/start-response.type.js";
import type { UserExistsResponse } from "./responses/user-exists-response.type.js";
import type { LoginResponse } from "./responses/login-response.type.js";
import type { VerifyMfaCodeResponse } from "./responses/verify-mfa-code-response.type.js";

export interface StubbedApiResponses {
  startResponse?: StartResponse;
  loginResponse?: LoginResponse;
  userExistsResponse?: UserExistsResponse;
  signUpResponse?: object;
  mfaResponse?: object;
  verifyCodeResponse?: object;
  verifyMfaCodeResponse?: VerifyMfaCodeResponse;
  authenticationAuthCodeResponse?: object;
  accountInterventionsResponse?: object;
}
