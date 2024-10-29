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
        contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        taxonomyLevel2: "sign in",
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
        contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        taxonomyLevel2: "sign in",
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
        contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        taxonomyLevel2: "sign in",
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
        contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
        taxonomyLevel2: "sign in",
      },
    },
  ],
  SECURITY_CODE_TRIES_EXCEEDED_GET: [
    {
      actionType: SecurityCodeErrorType.EmailMaxCodesSent,
      newCodeLink: PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
      isAccountCreationJourney: undefined,
      contentId: "445409a8-2aaf-47fc-82a9-b277eca4601d",
      taxonomyLevel2: "sign in",
    },
    {
      actionType: SecurityCodeErrorType.MfaMaxRetries,
      newCodeLink: pathWithQueryParam(
        PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
        SECURITY_CODE_ERROR,
        SecurityCodeErrorType.MfaMaxRetries
      ),
      isAccountCreationJourney: undefined,
      contentId: "445409a8-2aaf-47fc-82a9-b277eca4601d",
      taxonomyLevel2: "sign in",
    },
    {
      actionType: SecurityCodeErrorType.OtpMaxCodesSent,
      newCodeLink: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
      isAccountCreationJourney: undefined,
      contentId: "445409a8-2aaf-47fc-82a9-b277eca4601d",
      taxonomyLevel2: "sign in",
    },
    {
      actionType: SecurityCodeErrorType.OtpMaxRetries,
      newCodeLink: pathWithQueryParam(
        PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
        "isResendCodeRequest",
        "true"
      ),
      isAccountCreationJourney: true,
      contentId: "445409a8-2aaf-47fc-82a9-b277eca4601d",
      taxonomyLevel2: "create account",
    },
  ],
  SECURITY_CODE_CANNOT_REQUEST_GET: [
    {
      actionType: SecurityCodeErrorType.OtpBlocked,
      expectedCodeLink: PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER,
      contentId: "1277915f-ce6e-4a06-89a0-e3458f95631a",
      taxonomyLevel2: "sign in",
    },
    {
      actionType: SecurityCodeErrorType.MfaBlocked,
      expectedCodeLink: PATH_NAMES.RESEND_MFA_CODE,
      contentId: "1277915f-ce6e-4a06-89a0-e3458f95631a",
      taxonomyLevel2: "sign in",
    },
    {
      actionType: SecurityCodeErrorType.EmailBlocked,
      expectedCodeLink: PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT,
      contentId: "1277915f-ce6e-4a06-89a0-e3458f95631a",
      taxonomyLevel2: "sign in",
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
