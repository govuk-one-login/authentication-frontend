import { PATH_NAMES } from "../../app.constants.js";
import type { Request } from "express";

export const SECURITY_CODE_ERROR = "actionType";

export enum SecurityCodeErrorType {
  MfaMaxCodesSent = "mfaMaxCodesSent",
  MfaBlocked = "mfaBlocked",
  MfaMaxRetries = "mfaMaxRetries",
  OtpMaxCodesSent = "otpMaxCodesSent",
  OtpBlocked = "otpBlocked",
  OtpMaxRetries = "otpMaxRetries",
  EmailMaxCodesSent = "emailMaxCodesSent",
  EmailBlocked = "emailBlocked",
  EmailMaxRetries = "emailMaxRetries",
  AuthAppMfaNoCodeValidator = "authAppMfaNoCodeValidator",
  AuthAppMfaMaxRetries = "authAppMfaMaxRetries",
  ChangeSecurityCodesEmailMaxCodesSent = "changeSecurityCodesEmailMaxCodesSent",
  ChangeSecurityCodesEmailBlocked = "changeSecurityCodesEmailBlocked",
  ChangeSecurityCodesEmailMaxRetries = "changeSecurityCodesEmailMaxRetries",
  InvalidPasswordResetCodeMaxRetries = "invalidPasswordResetCodeMaxRetries",
}

export const ERROR_CODES = {
  SESSION_ID_MISSING_OR_INVALID: 1000,
  RESET_PASSWORD_LINK_MAX_RETRIES_REACHED: 1022,
  RESET_PASSWORD_LINK_BLOCKED: 1023,
  NEW_PASSWORD_SAME_AS_EXISTING: 1024,
  ENTERED_INVALID_MFA_MAX_TIMES: 1027,
  VERIFY_EMAIL_CODE_REQUEST_BLOCKED: 1029,
  VERIFY_PHONE_NUMBER_CODE_REQUEST_BLOCKED: 1030,
  VERIFY_PHONE_NUMBER_MAX_CODES_SENT: 1032,
  VERIFY_EMAIL_MAX_CODES_SENT: 1031,
  ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES: 1033,
  ENTERED_INVALID_VERIFY_PHONE_NUMBER_CODE_MAX_TIMES: 1034,
  MFA_SMS_MAX_CODES_SENT: 1025,
  MFA_CODE_REQUESTS_BLOCKED: 1026,
  INVALID_MFA_CODE: 1035,
  INVALID_VERIFY_EMAIL_CODE: 1036,
  INVALID_VERIFY_PHONE_NUMBER_CODE: 1037,
  ENTERED_INVALID_PASSWORD_RESET_CODE_MAX_TIMES: 1039,
  INVALID_PASSWORD_MAX_ATTEMPTS_REACHED: 1028,
  RESET_PASSWORD_INVALID_CODE: 1021,
  PASSWORD_IS_COMMON: 1040,
  AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED: 1042,
  AUTH_APP_INVALID_CODE: 1043,
  ACCOUNT_LOCKED: 1045,
  VERIFY_CHANGE_HOW_GET_SECURITY_CODES_MAX_CODES_SENT: 1046,
  VERIFY_CHANGE_HOW_GET_SECURITY_CODES_CODE_REQUEST_BLOCKED: 1047,
  VERIFY_CHANGE_HOW_GET_SECURITY_CODES_INVALID_CODE: 1048,
  RE_AUTH_CHECK_NO_USER_OR_NO_MATCH: 1056,
  RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED: 1057,
};

export const ERROR_CODE_MAPPING: { [p: string]: string } = {
  [ERROR_CODES.ACCOUNT_LOCKED]: pathWithQueryParam(
    PATH_NAMES["ACCOUNT_LOCKED"]
  ),
  [ERROR_CODES.INVALID_PASSWORD_MAX_ATTEMPTS_REACHED]: pathWithQueryParam(
    PATH_NAMES["ACCOUNT_LOCKED"]
  ),
  [ERROR_CODES.MFA_SMS_MAX_CODES_SENT]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.MfaMaxCodesSent
  ),
  [ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_WAIT"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.MfaBlocked
  ),
  [ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_INVALID"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.MfaMaxRetries
  ),
  [ERROR_CODES.VERIFY_PHONE_NUMBER_MAX_CODES_SENT]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.OtpMaxCodesSent
  ),
  [ERROR_CODES.VERIFY_PHONE_NUMBER_CODE_REQUEST_BLOCKED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.OtpBlocked
  ),
  [ERROR_CODES.ENTERED_INVALID_VERIFY_PHONE_NUMBER_CODE_MAX_TIMES]:
    pathWithQueryParam(
      PATH_NAMES["SECURITY_CODE_INVALID"],
      SECURITY_CODE_ERROR,
      SecurityCodeErrorType.OtpMaxRetries
    ),
  [ERROR_CODES.VERIFY_EMAIL_CODE_REQUEST_BLOCKED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.EmailBlocked
  ),
  [ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_INVALID"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.EmailMaxRetries
  ),
  [ERROR_CODES.ENTERED_INVALID_PASSWORD_RESET_CODE_MAX_TIMES]:
    pathWithQueryParam(
      PATH_NAMES["SECURITY_CODE_INVALID"],
      SECURITY_CODE_ERROR,
      SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries
    ),
  [ERROR_CODES.VERIFY_EMAIL_MAX_CODES_SENT]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_WAIT"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.EmailMaxCodesSent
  ),
  [ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_INVALID"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.AuthAppMfaMaxRetries
  ),
  [ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_MAX_CODES_SENT]:
    pathWithQueryParam(
      PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
      SECURITY_CODE_ERROR,
      SecurityCodeErrorType.ChangeSecurityCodesEmailMaxCodesSent
    ),
  [ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_INVALID_CODE]:
    pathWithQueryParam(
      PATH_NAMES["SECURITY_CODE_INVALID"],
      SECURITY_CODE_ERROR,
      SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries
    ),
  [ERROR_CODES.VERIFY_CHANGE_HOW_GET_SECURITY_CODES_CODE_REQUEST_BLOCKED]:
    pathWithQueryParam(
      PATH_NAMES["SECURITY_CODE_WAIT"],
      SECURITY_CODE_ERROR,
      SecurityCodeErrorType.ChangeSecurityCodesEmailBlocked
    ),
};

export function getErrorPathByCode(errorCode: number): string | undefined {
  const nextPath = ERROR_CODE_MAPPING[errorCode.toString()];

  if (!nextPath) {
    return undefined;
  }

  return nextPath;
}

export function pathWithQueryParam(
  path: string,
  queryParam?: string,
  value?: string | SecurityCodeErrorType
): string {
  if (queryParam && value) {
    const queryParams = new URLSearchParams({
      [queryParam]: value,
    }).toString();

    return path + "?" + queryParams;
  }

  return path;
}

export async function saveSessionState(req: Request): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    req.session.save((error) => {
      if (error) {
        reject(new Error(error));
        req.log.error(
          "Session could not be saved after setting the user journey."
        );
      } else {
        req.log.debug(
          "Session was successfully saved after setting the user journey."
        );
        resolve();
      }
    });
  });
}

export const JOURNEY_TYPE = {
  SIGN_IN: "sign-in",
  CREATE_ACCOUNT: "create-account",
};
