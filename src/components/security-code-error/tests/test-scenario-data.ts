import {
  pathWithQueryParam,
  SECURITY_CODE_ERROR,
  SecurityCodeErrorType,
} from "../../common/constants";
import { PATH_NAMES } from "../../../app.constants";

export const SCENARIOS = {
  SECURITY_CODE_EXPIRED_GET: [
    {
      actionType: SecurityCodeErrorType.EmailMaxRetries,
      expectedRenderOptions: {
        newCodeLink: pathWithQueryParam(
          PATH_NAMES.RESEND_EMAIL_CODE,
          "requestNewCode",
          "true"
        ),
        isAuthApp: false,
        isBlocked: false,
        show2HrScreen: true,
      },
    },
    {
      actionType: SecurityCodeErrorType.MfaMaxRetries,
      expectedRenderOptions: {
        newCodeLink: pathWithQueryParam(
          PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
          SECURITY_CODE_ERROR,
          SecurityCodeErrorType.MfaMaxRetries
        ),
        isAuthApp: false,
        isBlocked: true,
        show2HrScreen: false,
      },
    },
    {
      actionType: SecurityCodeErrorType.AuthAppMfaMaxRetries,
      expectedRenderOptions: {
        newCodeLink: pathWithQueryParam(
          PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
          SECURITY_CODE_ERROR,
          SecurityCodeErrorType.AuthAppMfaMaxRetries
        ),
        isAuthApp: true,
        isBlocked: true,
        show2HrScreen: false,
      },
    },
    {
      actionType: SecurityCodeErrorType.OtpMaxRetries,
      expectedRenderOptions: {
        newCodeLink: pathWithQueryParam(
          PATH_NAMES.RESEND_MFA_CODE,
          "isResendCodeRequest",
          "true"
        ),
        isAuthApp: false,
        isBlocked: true,
        show2HrScreen: false,
      },
    },
  ],
  SECURITY_CODE_TRIES_EXCEEDED_GET: [
    {
      actionType: SecurityCodeErrorType.EmailMaxCodesSent,
      newCodeLink: PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
      isAccountCreationJourney: undefined,
    },
    {
      actionType: SecurityCodeErrorType.MfaMaxRetries,
      newCodeLink: pathWithQueryParam(
        PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
        SECURITY_CODE_ERROR,
        SecurityCodeErrorType.MfaMaxRetries
      ),
      isAccountCreationJourney: undefined,
    },
    {
      actionType: SecurityCodeErrorType.OtpMaxCodesSent,
      newCodeLink: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
      isAccountCreationJourney: undefined,
    },
    {
      actionType: SecurityCodeErrorType.OtpMaxRetries,
      newCodeLink: pathWithQueryParam(
        PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
        "isResendCodeRequest",
        "true"
      ),
      isAccountCreationJourney: true,
    },
  ],
  SECURITY_CODE_CANNOT_REQUEST_GET: [
    {
      actionType: SecurityCodeErrorType.OtpBlocked,
      expectedCodeLink: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
    },
    {
      actionType: SecurityCodeErrorType.MfaBlocked,
      expectedCodeLink: PATH_NAMES.RESEND_MFA_CODE,
    },
    {
      actionType: SecurityCodeErrorType.EmailBlocked,
      expectedCodeLink: PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
    },
  ],
  ACCOUNT_CREATION_JOURNEY: [
    {
      action: SecurityCodeErrorType.EmailMaxRetries,
      isBlocked: false,
      nextPath: PATH_NAMES.RESEND_EMAIL_CODE,
      queryParam: "requestNewCode",
    },
    {
      action: SecurityCodeErrorType.OtpMaxRetries,
      isBlocked: true,
      nextPath: PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
      queryParam: "isResendCodeRequest",
    },
  ],
};
