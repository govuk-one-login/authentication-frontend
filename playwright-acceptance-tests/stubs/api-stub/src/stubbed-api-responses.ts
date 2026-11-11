import type {
  StartResponse,
  UserExistsResponse,
  LoginResponse,
  VerifyMfaCodeResponse,
  VerifyCodeResponse,
  MfaResponse,
  ResetPasswordRequestResponse,
  AccountInterventionsResponse,
  SignUpResponse,
} from "./responses/api-responses.type.js";

export interface StubbedApiResponses {
  startResponse?: StartResponse;
  loginResponse?: LoginResponse;
  userExistsResponse?: UserExistsResponse;
  signUpResponse?: SignUpResponse;
  mfaResponse?: MfaResponse;
  verifyCodeResponse?: VerifyCodeResponse;
  verifyMfaCodeResponse?: VerifyMfaCodeResponse;
  authenticationAuthCodeResponse?: object;
  accountInterventionsResponse?: AccountInterventionsResponse;
  resetPasswordRequestResponse?: ResetPasswordRequestResponse;
}
