import { Request, Response } from "express";
import {
  SecurityCodeErrorType,
  pathWithQueryParam,
  SECURITY_CODE_ERROR,
} from "../common/constants";
import { PATH_NAMES } from "../../app.constants";
import {
  getCodeEnteredWrongBlockDurationInMinutes,
  getCodeRequestBlockDurationInMinutes,
} from "../../config";

export function securityCodeInvalidGet(req: Request, res: Response): void {
  const isNotEmailCode =
    req.query.actionType !== SecurityCodeErrorType.EmailMaxRetries;
  if (isNotEmailCode) {
    req.session.user.wrongCodeEnteredLock = new Date(
      Date.now() + getCodeEnteredWrongBlockDurationInMinutes() * 60000
    ).toUTCString();
  }
  return res.render("security-code-error/index.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
    isAuthApp: isAuthApp(req.query.actionType as SecurityCodeErrorType),
    isBlocked: isNotEmailCode,
  });
}

export function securityCodeTriesExceededGet(
  req: Request,
  res: Response
): void {
  req.session.user.codeRequestLock = new Date(
    Date.now() + getCodeRequestBlockDurationInMinutes() * 60000
  ).toUTCString();
  return res.render("security-code-error/index-too-many-requests.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
    isResendCodeRequest: req.query.isResendCodeRequest,
  });
}

export function securityCodeCannotRequestCodeGet(
  req: Request,
  res: Response
): void {
  res.render("security-code-error/index-too-many-requests.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
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

function getNewCodePath(actionType: SecurityCodeErrorType) {
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
      return pathWithQueryParam(
        PATH_NAMES.RESEND_MFA_CODE,
        "isResendCodeRequest",
        "true"
      );
    case SecurityCodeErrorType.EmailMaxCodesSent:
    case SecurityCodeErrorType.EmailBlocked:
      return PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT;
    case SecurityCodeErrorType.EmailMaxRetries:
      return pathWithQueryParam(
        PATH_NAMES.RESEND_EMAIL_CODE,
        "requestNewCode",
        "true"
      );
    case SecurityCodeErrorType.ChangeSecurityCodesEmailMaxCodesSent:
    case SecurityCodeErrorType.ChangeSecurityCodesEmailBlocked:
      return PATH_NAMES.SECURITY_CODE_CHECK_TIME_LIMIT;
    case SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries:
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
