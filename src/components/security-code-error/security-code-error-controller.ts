import { Request, Response } from "express";
import { SecurityCodeErrorType } from "../common/constants";
import { PATH_NAMES } from "../../app.constants";

export function securityCodeInvalidGet(req: Request, res: Response): void {
  res.render("security-code-error/index.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
  });
}

export function securityCodeTriesExceededGet(
  req: Request,
  res: Response
): void {
  res.render("security-code-error/index-too-many-requests.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
  });
}

export function securityCodeCannotRequestCodeGet(
  req: Request,
  res: Response
): void {
  res.render("security-code-error/index-wait.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
  });
}

function getNewCodePath(actionType: SecurityCodeErrorType) {
  switch (actionType) {
    case SecurityCodeErrorType.MfaMaxCodesSent:
    case SecurityCodeErrorType.MfaBlocked:
    case SecurityCodeErrorType.MfaMaxRetries:
      return PATH_NAMES.RESEND_MFA_CODE;
    case SecurityCodeErrorType.OtpMaxCodesSent:
    case SecurityCodeErrorType.OtpBlocked:
    case SecurityCodeErrorType.OtpMaxRetries:
      return PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER;
    case SecurityCodeErrorType.EmailMaxCodesSent:
    case SecurityCodeErrorType.EmailBlocked:
    case SecurityCodeErrorType.EmailMaxRetries:
      return PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT;
  }
}
