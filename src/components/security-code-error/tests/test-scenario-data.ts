import {
  pathWithQueryParam,
  SECURITY_CODE_ERROR,
  SecurityCodeErrorType,
} from "../../common/constants.js";
import { PATH_NAMES } from "../../../app.constants.js";
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
        newCodeLink: PATH_NAMES.RESEND_MFA_CODE,
        isAuthApp: false,
        isBlocked: true,
        show2HrScreen: false,
      },
    },
  ],
  ACCOUNT_CREATION_JOURNEY: [
    {
      action: SecurityCodeErrorType.EmailMaxRetries,
      isBlocked: false,
      newCodeLink: pathWithQueryParam(
        PATH_NAMES.RESEND_EMAIL_CODE,
        "requestNewCode",
        "true"
      ),
    },
    {
      action: SecurityCodeErrorType.OtpMaxRetries,
      isBlocked: true,
      newCodeLink: PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
    },
  ],
};
