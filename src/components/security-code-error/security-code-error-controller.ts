import { Request, Response } from "express";
import {
  pathWithQueryParam,
  SECURITY_CODE_ERROR,
  SecurityCodeErrorType,
} from "../common/constants";
import { PATH_NAMES } from "../../app.constants";
import {
  getAccountRecoveryCodeEnteredWrongBlockDurationInMinutes,
  getCodeEnteredWrongBlockDurationInMinutes,
  getCodeRequestBlockDurationInMinutes,
  getPasswordResetCodeEnteredWrongBlockDurationInMinutes,
  getReducedBlockDurationInMinutes,
} from "../../config";
import { UserSession } from "../../types";
import { isLocked, timestampNMinutesFromNow } from "../../utils/lock-helper";

const oplValues = {
  mfaMaxRetries: {
    contentId: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
  },
  mfaBlocked: {
    contentId: "1277915f-ce6e-4a06-89a0-e3458f95631a",
  },
  enteredExceeded: {
    contentId: "727a0395-cc00-48eb-a411-bfe9d8ac5fc8",
  },
  requestedTooManyTimes: {
    contentId: "445409a8-2aaf-47fc-82a9-b277eca4601d",
  },
};

export function securityCodeInvalidGet(req: Request, res: Response): void {
  const { isAccountCreationJourney } = req.session.user;
  const actionType = req.query.actionType as SecurityCodeErrorType;
  const isEmailCode = [
    SecurityCodeErrorType.EmailMaxRetries,
    SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries,
    SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries,
  ]
    .map((e) => e.valueOf())
    .includes(actionType.toString());

  setBlockDurationIfRequired(req, actionType, isEmailCode);

  const show2HrScreen = isJourneyWhere2HourLockoutScreenShown(
    req.session.user,
    isEmailCode
  );

  return res.render("security-code-error/index.njk", {
    newCodeLink: getNewCodePath(
      req.query.actionType as SecurityCodeErrorType,
      req.session.user.isAccountCreationJourney
    ),
    isAuthApp: isAuthApp(req.query.actionType as SecurityCodeErrorType),
    isBlocked: actionType !== SecurityCodeErrorType.EmailMaxRetries,
    show2HrScreen: show2HrScreen,
    contentId: oplValues.mfaMaxRetries.contentId,
    taxonomyLevel2: isAccountCreationJourney ? "create account" : "sign in",
  });
}

export function securityCodeTriesExceededGet(
  req: Request,
  res: Response
): void {
  if (!isLocked(req.session.user.codeRequestLock)) {
    req.session.user.codeRequestLock = timestampNMinutesFromNow(
      getCodeRequestBlockDurationInMinutes()
    );
  }

  const { isAccountCreationJourney } = req.session.user;

  return res.render("security-code-error/index-too-many-requests.njk", {
    newCodeLink: getNewCodePath(
      req.query.actionType as SecurityCodeErrorType,
      req.session.user.isAccountCreationJourney
    ),
    isResendCodeRequest: req.query.isResendCodeRequest,
    isAccountCreationJourney: req.session.user?.isAccountCreationJourney,
    contentId: oplValues.requestedTooManyTimes.contentId,
    taxonomyLevel2: isAccountCreationJourney ? "create account" : "sign in",
  });
}

export function securityCodeCannotRequestCodeGet(
  req: Request,
  res: Response
): void {
  const { isAccountCreationJourney } = req.session.user;

  res.render("security-code-error/index-too-many-requests.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
    contentId: oplValues.mfaBlocked.contentId,
    taxonomyLevel2: isAccountCreationJourney ? "create account" : "sign in",
  });
}

export function securityCodeEnteredExceededGet(
  req: Request,
  res: Response
): void {
  const { isAccountCreationJourney } = req.session.user;

  res.render("security-code-error/index-security-code-entered-exceeded.njk", {
    newCodeLink: isAuthApp(req.query.actionType as SecurityCodeErrorType)
      ? PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
      : PATH_NAMES.RESEND_MFA_CODE,
    isAuthApp: isAuthApp(req.query.actionType as SecurityCodeErrorType),
    contentId: oplValues.mfaMaxRetries.contentId,
    taxonomyLevel2: isAccountCreationJourney ? "create account" : "sign in",
  });
}

export function getNewCodePath(
  actionType: SecurityCodeErrorType,
  isAccountCreationJourney?: boolean
): string {
  switch (actionType) {
    case SecurityCodeErrorType.MfaMaxCodesSent:
    case SecurityCodeErrorType.MfaBlocked:
      return PATH_NAMES.RESEND_MFA_CODE;
    case SecurityCodeErrorType.MfaMaxRetries:
      return pathWithQueryParam(
        PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
        SECURITY_CODE_ERROR,
        SecurityCodeErrorType.MfaMaxRetries
      );
    case SecurityCodeErrorType.AuthAppMfaMaxRetries:
      return pathWithQueryParam(
        PATH_NAMES.SECURITY_CODE_ENTERED_EXCEEDED,
        SECURITY_CODE_ERROR,
        SecurityCodeErrorType.AuthAppMfaMaxRetries
      );
    case SecurityCodeErrorType.OtpMaxCodesSent:
    case SecurityCodeErrorType.OtpBlocked:
      return PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER;
    case SecurityCodeErrorType.OtpMaxRetries:
      return isAccountCreationJourney
        ? pathWithQueryParam(
            PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION,
            "isResendCodeRequest",
            "true"
          )
        : pathWithQueryParam(
            PATH_NAMES.RESEND_MFA_CODE,
            "isResendCodeRequest",
            "true"
          );
    case SecurityCodeErrorType.EmailMaxCodesSent:
    case SecurityCodeErrorType.EmailBlocked:
      return PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT;
    case SecurityCodeErrorType.ChangeSecurityCodesEmailMaxCodesSent:
    case SecurityCodeErrorType.ChangeSecurityCodesEmailBlocked:
      return PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT;
    case SecurityCodeErrorType.EmailMaxRetries:
    case SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries:
    case SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries:
      return pathWithQueryParam(
        PATH_NAMES.RESEND_EMAIL_CODE,
        "requestNewCode",
        "true"
      );
  }
}

function setBlockDurationIfRequired(
  req: Request,
  actionType: SecurityCodeErrorType,
  isEmailCode: boolean
) {
  if (
    isReducedDurationJourney(actionType, req.session.user) &&
    !isLocked(req.session.user.wrongCodeEnteredLock)
  ) {
    req.session.user.wrongCodeEnteredLock = timestampNMinutesFromNow(
      getReducedBlockDurationInMinutes()
    );
  } else if (!isEmailCode && !isLocked(req.session.user.wrongCodeEnteredLock)) {
    req.session.user.wrongCodeEnteredLock = timestampNMinutesFromNow(
      getCodeEnteredWrongBlockDurationInMinutes()
    );
  } else if (
    actionType === SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries &&
    !isLocked(req.session.user.wrongCodeEnteredAccountRecoveryLock)
  ) {
    req.session.user.wrongCodeEnteredAccountRecoveryLock =
      timestampNMinutesFromNow(
        getAccountRecoveryCodeEnteredWrongBlockDurationInMinutes()
      );
  } else if (
    actionType === SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries &&
    !isLocked(req.session.user.wrongCodeEnteredPasswordResetLock)
  ) {
    req.session.user.wrongCodeEnteredPasswordResetLock =
      timestampNMinutesFromNow(
        getPasswordResetCodeEnteredWrongBlockDurationInMinutes()
      );
  }
}

function isAuthApp(actionType: SecurityCodeErrorType) {
  switch (actionType) {
    case SecurityCodeErrorType.AuthAppMfaMaxRetries:
      return true;
    default:
      return false;
  }
}

function isReducedDurationJourney(
  actionType: SecurityCodeErrorType,
  user: UserSession
) {
  return (
    SecurityCodeErrorType.OtpMaxRetries === actionType &&
    (user.isAccountCreationJourney || user.isAccountRecoveryJourney)
  );
}

function isJourneyWhere2HourLockoutScreenShown(
  user: UserSession,
  isEmailCode: boolean
): boolean {
  return (
    (user.isSignInJourney &&
      !user.isAccountPartCreated &&
      !user.isAccountRecoveryJourney) ||
    user.isPasswordResetJourney ||
    (isEmailCode && !user.isAccountCreationJourney) ||
    (isEmailCode && user.isAccountRecoveryJourney) ||
    false
  );
}
