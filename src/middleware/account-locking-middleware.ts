import { NextFunction, Request, Response } from "express";
import { support2hrLockout } from "../config";
import { SecurityCodeErrorType } from "../components/common/constants";
import { getNewCodePath } from "../components/security-code-error/security-code-error-controller";

export function accountLockingMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
){
  const newCodeLink = getNewCodePath(req.query.actionType as SecurityCodeErrorType);
    if (
      req.session.user.wrongCodeEnteredLock &&
      new Date().getTime() <
      new Date(req.session.user.wrongCodeEnteredLock).getTime()
    ) {
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: newCodeLink,
          isAuthApp: true,
          show2HrScreen: show2HrScreenTooManyCodes(req),
        }
      );
    }
    if (
      req.session.user.codeRequestLock &&
      new Date().getTime() < new Date(req.session.user.codeRequestLock).getTime()
    ) {
      return res.render("security-code-error/index-wait.njk", {
        newCodeLink: newCodeLink,
        support2hrLockout: support2hrLockout(),
        isAccountCreationJourney: req.session.user.isAccountCreationJourney,
      });
    }
    next();
}

export function accountLockingResetPasswordMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
){
  const newCodeLink = getNewCodePath(req.query.actionType as SecurityCodeErrorType);
  if (
    req.session.user.wrongCodeEnteredPasswordResetLock &&
    new Date().getTime() <
    new Date(req.session.user.wrongCodeEnteredPasswordResetLock).getTime()
  ) {
    return res.render(
      "security-code-error/index-security-code-entered-exceeded.njk",
      {
        newCodeLink: newCodeLink,
        show2HrScreen: show2HrScreenTooManyCodes(req),
      }
    );
  }
  if (
    req.session.user.codeRequestLock &&
    new Date().getTime() < new Date(req.session.user.codeRequestLock).getTime()
  ) {
    return res.render("security-code-error/index-wait.njk", {
      newCodeLink: newCodeLink,
      support2hrLockout: support2hrLockout(),
      isAccountCreationJourney: req.session.user.isAccountCreationJourney,
    });
  }
  next();
}
 export function show2HrScreenTooManyCodes(req: Request){
   if (support2hrLockout()) {
     const isNotEmailCode =
       req.query.actionType !== SecurityCodeErrorType.EmailMaxRetries &&
       req.query.actionType !==
       SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries &&
       req.query.actionType !==
       SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries;
     if (
       (req.session.user.isSignInJourney &&
         !req.session.user.isAccountPartCreated &&
         !req.session.user.isAccountRecoveryJourney) ||
       req.session.user.isPasswordResetJourney ||
       req.session.user.journey.nextPath === "/reset-password-check-email"||
       (!isNotEmailCode && !req.session.user.isAccountCreationJourney) ||
       (!isNotEmailCode && req.session.user.isAccountRecoveryJourney)
     ) {
       return true;
     }
   }
   return false;
 }