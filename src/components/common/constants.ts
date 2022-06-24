import { PATH_NAMES } from "../../app.constants";
import { getNextState } from "./state-machine/state-machine";

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

export const ERROR_CODES = {
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
  INVALID_PASSWORD_MAX_ATTEMPTS_REACHED: 1028,
  RESET_PASSWORD_INVALID_CODE: 1021,
  AUTH_APP_INVALID_CODE: 1043,
};

export const ERROR_CODE_MAPPING: { [p: string]: string } = {
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
    PATH_NAMES["SECURITY_CODE_WAIT"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.OtpBlocked
  ),
  [ERROR_CODES.ENTERED_INVALID_VERIFY_PHONE_NUMBER_CODE_MAX_TIMES]:
    pathWithQueryParam(
      PATH_NAMES["SECURITY_CODE_INVALID"],
      SECURITY_CODE_ERROR,
      SecurityCodeErrorType.OtpMaxRetries
    ),
  [ERROR_CODES.VERIFY_EMAIL_MAX_CODES_SENT]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_REQUEST_EXCEEDED"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.EmailMaxCodesSent
  ),
  [ERROR_CODES.VERIFY_PHONE_NUMBER_CODE_REQUEST_BLOCKED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_WAIT"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.OtpBlocked
  ),
  [ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_INVALID"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.EmailMaxRetries
  ),
  [ERROR_CODES.VERIFY_EMAIL_CODE_REQUEST_BLOCKED]: pathWithQueryParam(
    PATH_NAMES["SECURITY_CODE_WAIT"],
    SECURITY_CODE_ERROR,
    SecurityCodeErrorType.EmailBlocked
  ),
};

export function getErrorPathByCode(errorCode: number): string | undefined {
  const nextPath = ERROR_CODE_MAPPING[errorCode.toString()];

  if (!nextPath) {
    return undefined;
  }

  return nextPath;
}

function pathWithQueryParam(
  path: string,
  queryParam?: string,
  value?: string | SecurityCodeErrorType
) {
  if (queryParam && value) {
    const queryParams = new URLSearchParams({
      [queryParam]: value,
    }).toString();

    return path + "?" + queryParams;
  }

  return path;
}

export function getNextPathAndUpdateJourney(
  req: any,
  path: string,
  event: string,
  ctx?: any,
  sessionId?: string
): string {
  const nextState = getNextState(path, event, ctx);

  req.session.user.journey = {
    nextPath: nextState.value,
    optionalPaths:
      Object.keys(nextState.meta).length > 0
        ? nextState.meta["AUTH." + nextState.value].optionalPaths
        : [],
  };

  req.log.info(
    `User journey transitioned from ${req.path} to ${nextState.value} with session id ${sessionId}`
  );

  if (!nextState) {
    throw Error(
      `Invalid user journey. No transition found from ${path} with event ${event}`
    );
  }

  return nextState.value;
}

export const JOURNEY_TYPE = {
  SIGN_IN: "sign-in",
  CREATE_ACCOUNT: "create-account",
};
