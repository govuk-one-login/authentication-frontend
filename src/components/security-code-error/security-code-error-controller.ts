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
  support2hrLockout,
} from "../../config";

export function securityCodeInvalidGet(req: Request, res: Response): void {
  const actionType = req.query.actionType;
  const isEmailCode = [
    SecurityCodeErrorType.EmailMaxRetries,
    SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries,
    SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries,
  ]
    .map((e) => e.valueOf())
    .includes(actionType.toString());

  if (!isEmailCode) {
    req.session.user.wrongCodeEnteredLock = timestampNMinutesFromNow(
      getCodeEnteredWrongBlockDurationInMinutes()
    );
  }

  if (actionType === SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries) {
    req.session.user.wrongCodeEnteredAccountRecoveryLock =
      timestampNMinutesFromNow(
        getAccountRecoveryCodeEnteredWrongBlockDurationInMinutes()
      );
  }

  if (actionType === SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries) {
    req.session.user.wrongCodeEnteredPasswordResetLock =
      timestampNMinutesFromNow(
        getPasswordResetCodeEnteredWrongBlockDurationInMinutes()
      );
  }

  let show2HrScreen = false;
  if (support2hrLockout()) {
    if (
      (req.session.user.isSignInJourney &&
        !req.session.user.isAccountPartCreated &&
        !req.session.user.isAccountRecoveryJourney) ||
      req.session.user.isPasswordResetJourney ||
      (isEmailCode && !req.session.user.isAccountCreationJourney) ||
      (isEmailCode && req.session.user.isAccountRecoveryJourney)
    ) {
      show2HrScreen = true;
    }
  }

  return res.render("security-code-error/index.njk", {
    newCodeLink: getNewCodePath(
      req.query.actionType as SecurityCodeErrorType,
      req.session.user.isAccountCreationJourney
    ),
    isAuthApp: isAuthApp(req.query.actionType as SecurityCodeErrorType),
    isBlocked: actionType !== SecurityCodeErrorType.EmailMaxRetries,
    show2HrScreen: show2HrScreen,
  });
}

export function securityCodeTriesExceededGet(
  req: Request,
  res: Response
): void {
  req.session.user.codeRequestLock = timestampNMinutesFromNow(
    getCodeRequestBlockDurationInMinutes()
  );

  return res.render("security-code-error/index-too-many-requests.njk", {
    newCodeLink: getNewCodePath(
      req.query.actionType as SecurityCodeErrorType,
      req.session.user.isAccountCreationJourney
    ),
    isResendCodeRequest: req.query.isResendCodeRequest,
    isAccountCreationJourney: req.session.user?.isAccountCreationJourney,
    support2hrLockout: support2hrLockout(),
  });
}

export function securityCodeCannotRequestCodeGet(
  req: Request,
  res: Response
): void {
  res.render("security-code-error/index-too-many-requests.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
    support2hrLockout: support2hrLockout(),
  });
}

export function securityCodeEnteredExceededGet(
  req: Request,
  res: Response
): void {
  res.render("security-code-error/index-security-code-entered-exceeded.njk", {
    newCodeLink: isAuthApp(req.query.actionType as SecurityCodeErrorType)
      ? PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
      : PATH_NAMES.RESEND_MFA_CODE,
    isAuthApp: isAuthApp(req.query.actionType as SecurityCodeErrorType),
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

function isAuthApp(actionType: SecurityCodeErrorType) {
  switch (actionType) {
    case SecurityCodeErrorType.AuthAppMfaMaxRetries:
      return true;
    default:
      return false;
  }
}

function timestampNMinutesFromNow(durationInMinutes: number): string {
  return new Date(Date.now() + durationInMinutes * 60000).toUTCString();
}
