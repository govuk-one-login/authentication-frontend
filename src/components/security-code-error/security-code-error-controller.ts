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
  }
};

export function securityCodeInvalidGet(req: Request, res: Response): void {
  const { isAccountCreationJourney } =
  req.session.user;
    
  const isNotEmailCode =
    req.query.actionType !== SecurityCodeErrorType.EmailMaxRetries &&
    req.query.actionType !==
      SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries &&
    req.query.actionType !==
      SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries;

  let showFifteenMinutesParagraph = false;

  if (isNotEmailCode) {
    req.session.user.wrongCodeEnteredLock = new Date(
      Date.now() + getCodeEnteredWrongBlockDurationInMinutes() * 60000
    ).toUTCString();
  }

  if (
    req.query.actionType ===
    SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries
  ) {
    showFifteenMinutesParagraph = true;
    req.session.user.wrongCodeEnteredAccountRecoveryLock = new Date(
      Date.now() +
        getAccountRecoveryCodeEnteredWrongBlockDurationInMinutes() * 60000
    ).toUTCString();
  }

  if (
    req.query.actionType ===
    SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries
  ) {
    showFifteenMinutesParagraph = true;
    req.session.user.wrongCodeEnteredPasswordResetLock = new Date(
      Date.now() +
        getPasswordResetCodeEnteredWrongBlockDurationInMinutes() * 60000
    ).toUTCString();
  }

  let show2HrScreen = false;
  if (support2hrLockout()) {
    if (
      (req.session.user.isSignInJourney &&
        !req.session.user.isAccountPartCreated &&
        !req.session.user.isAccountRecoveryJourney) ||
      req.session.user.isPasswordResetJourney ||
      (!isNotEmailCode && !req.session.user.isAccountCreationJourney) ||
      (!isNotEmailCode && req.session.user.isAccountRecoveryJourney)
    ) {
      show2HrScreen = true;
    }
  }

  return res.render("security-code-error/index.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
    isAuthApp: isAuthApp(req.query.actionType as SecurityCodeErrorType),
    isBlocked: isNotEmailCode || showFifteenMinutesParagraph,
    show2HrScreen: show2HrScreen,
    contentId: oplValues.mfaMaxRetries.contentId,
    taxonomyLevel2: isAccountCreationJourney  ? "create account" : "sign in"
  });
}

export function securityCodeTriesExceededGet(
  req: Request,
  res: Response
): void {
  req.session.user.codeRequestLock = new Date(
    Date.now() + getCodeRequestBlockDurationInMinutes() * 60000
  ).toUTCString();
  const isNotEmailCode =
    req.query.actionType !== SecurityCodeErrorType.EmailMaxRetries &&
    req.query.actionType !==
      SecurityCodeErrorType.ChangeSecurityCodesEmailMaxRetries &&
    req.query.actionType !==
      SecurityCodeErrorType.InvalidPasswordResetCodeMaxRetries;

  let show2HrScreen = false;
  if (support2hrLockout()) {
    show2HrScreen =
      (req.session.user.isSignInJourney &&
        !req.session.user.isAccountPartCreated &&
        !req.session.user.isAccountRecoveryJourney) ||
      req.session.user.isPasswordResetJourney ||
      req.session.user.isAccountRecoveryJourney ||
      (!isNotEmailCode && !req.session.user.isAccountCreationJourney);
  }

  const { isAccountCreationJourney } =
  req.session.user;

  return res.render("security-code-error/index-too-many-requests.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
    isResendCodeRequest: req.query.isResendCodeRequest,
    show2HrScreen: show2HrScreen,
    isAccountCreationJourney: req.session.user?.isAccountCreationJourney,
    support2hrLockout: support2hrLockout(),
    contentId: oplValues.requestedTooManyTimes.contentId,
    taxonomyLevel2: isAccountCreationJourney  ? "create account" : "sign in"
  });
}


export function securityCodeCannotRequestCodeGet(
  req: Request,
  res: Response
): void {
  const { isAccountCreationJourney } =
  req.session.user;
  
  res.render("security-code-error/index-too-many-requests.njk", {
    newCodeLink: getNewCodePath(req.query.actionType as SecurityCodeErrorType),
    support2hrLockout: support2hrLockout(),
    contentId: oplValues.mfaBlocked.contentId,
    taxonomyLevel2: isAccountCreationJourney  ? "create account" : "sign in"
  });
}

export function securityCodeEnteredExceededGet(
  req: Request,
  res: Response
): void {
  const { isAccountCreationJourney } =
  req.session.user;
  
  res.render("security-code-error/index-security-code-entered-exceeded.njk", {
    newCodeLink: isAuthApp(req.query.actionType as SecurityCodeErrorType)
      ? PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
      : PATH_NAMES.RESEND_MFA_CODE,
    isAuthApp: isAuthApp(req.query.actionType as SecurityCodeErrorType),
    contentId: oplValues.mfaMaxRetries.contentId,
    taxonomyLevel2: isAccountCreationJourney  ? "create account" : "sign in"
  });
}

export function getNewCodePath(actionType: SecurityCodeErrorType): string {
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
