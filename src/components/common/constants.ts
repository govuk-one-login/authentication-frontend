import { PATH_NAMES, USER_STATE } from "../../app.constants";
import * as querystring from "querystring";

const SECURITY_CODE_ERROR = "actionType";

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
}

const SECURITY_CODE_ERROR_STATES: { [p: string]: string } = {
  [USER_STATE.MFA_SMS_MAX_CODES_SENT]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.MfaMaxCodesSent
  ),
  [USER_STATE.MFA_CODE_REQUESTS_BLOCKED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_WAIT"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.MfaBlocked
  ),
  [USER_STATE.MFA_CODE_MAX_RETRIES_REACHED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_INVALID"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.MfaMaxRetries
  ),
  [USER_STATE.PHONE_NUMBER_MAX_CODES_SENT]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.OtpMaxCodesSent
  ),
  [USER_STATE.PHONE_NUMBER_CODE_REQUESTS_BLOCKED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_WAIT"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.OtpBlocked
  ),
  [USER_STATE.PHONE_NUMBER_CODE_MAX_RETRIES_REACHED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_INVALID"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.OtpMaxRetries
  ),
  [USER_STATE.EMAIL_MAX_CODES_SENT]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.EmailMaxCodesSent
  ),
  [USER_STATE.EMAIL_CODE_REQUESTS_BLOCKED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_WAIT"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.EmailBlocked
  ),
  [USER_STATE.EMAIL_CODE_MAX_RETRIES_REACHED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_INVALID"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.EmailMaxRetries
  ),
};

const STATE_TO_PATH_MAPPING: { [p: string]: string } = {
  ...SECURITY_CODE_ERROR_STATES,
  [USER_STATE.AUTHENTICATED]: PATH_NAMES["AUTH_CODE"],
  [USER_STATE.LOGGED_IN]: PATH_NAMES["ENTER_MFA"],
  [USER_STATE.REQUIRES_TWO_FACTOR]:
    PATH_NAMES["CREATE_ACCOUNT_ENTER_PHONE_NUMBER"],
  [USER_STATE.ACCOUNT_LOCKED]: PATH_NAMES["ACCOUNT_LOCKED"],
  [USER_STATE.UPDATED_TERMS_AND_CONDITIONS]:
    PATH_NAMES["UPDATED_TERMS_AND_CONDITIONS"],
  [USER_STATE.UPDATED_TERMS_AND_CONDITIONS_ACCEPTED]: PATH_NAMES["AUTH_CODE"],
  [USER_STATE.UPLIFT_REQUIRED_CM]: PATH_NAMES["UPLIFT_JOURNEY"],
  [USER_STATE.CONSENT_ADDED]: PATH_NAMES["AUTH_CODE"],
  [USER_STATE.USER_NOT_FOUND]: PATH_NAMES["ACCOUNT_NOT_FOUND"],
  [USER_STATE.VERIFY_EMAIL_CODE_SENT]: PATH_NAMES["CHECK_YOUR_EMAIL"],
  [USER_STATE.EMAIL_CODE_VERIFIED]: PATH_NAMES["CREATE_ACCOUNT_SET_PASSWORD"],
  [USER_STATE.CONSENT_REQUIRED]: PATH_NAMES["SHARE_INFO"],
  [USER_STATE.MFA_CODE_VERIFIED]: PATH_NAMES["AUTH_CODE"],
  [USER_STATE.VERIFY_PHONE_NUMBER_CODE_SENT]: PATH_NAMES["CHECK_YOUR_PHONE"],
  [USER_STATE.LOGGED_IN]: PATH_NAMES["ENTER_MFA"],
  [USER_STATE.MFA_SMS_CODE_SENT]: PATH_NAMES["ENTER_MFA"],
  [USER_STATE.AUTHENTICATION_REQUIRED]: PATH_NAMES["ENTER_PASSWORD"],
  [USER_STATE.AUTHENTICATION_REQUIRED_ACCOUNT_EXISTS]:
    PATH_NAMES["ENTER_PASSWORD_ACCOUNT_EXISTS"],
  [USER_STATE.TWO_FACTOR_REQUIRED]:
    PATH_NAMES["CREATE_ACCOUNT_ENTER_PHONE_NUMBER"],
  [USER_STATE.PHONE_NUMBER_CODE_VERIFIED]:
    PATH_NAMES["CREATE_ACCOUNT_SUCCESSFUL"],
};

function pathWithQueryParam(
  path: string,
  queryParam: string,
  value: string | SecurityCodeErrorType
) {
  return path + "?" + querystring.stringify({ [queryParam]: value });
}

export function getNextPathByState(sessionState: string): string {
  let nextPath = STATE_TO_PATH_MAPPING[sessionState];

  if (!nextPath) {
    nextPath = PATH_NAMES.SIGN_IN_OR_CREATE;
  }

  return nextPath;
}
