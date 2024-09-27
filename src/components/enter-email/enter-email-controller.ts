import { Request, Response } from "express";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { enterEmailService } from "./enter-email-service";
import { EnterEmailServiceInterface, LockoutInformation } from "./types";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
  SecurityCodeErrorType,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import xss from "xss";
import { CheckReauthServiceInterface } from "../check-reauth-users/types";
import { checkReauthUsersService } from "../check-reauth-users/check-reauth-users-service";
import { support2hrLockout, supportReauthentication } from "../../config";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { getNewCodePath } from "../security-code-error/security-code-error-controller";
import { isLocked, timestampNSecondsFromNow } from "../../utils/lock-helper";

export const RE_ENTER_EMAIL_TEMPLATE =
  "enter-email/index-re-enter-email-account.njk";
const ENTER_EMAIL_TEMPLATE = "enter-email/index-existing-account.njk";
const BLOCKED_TEMPLATE =
  "enter-email/index-sign-in-details-entered-too-many-times.njk";
const EMAIL_ERROR_KEY = "pages.reEnterEmailAccount.enterYourEmailAddressError";

export function enterEmailGet(req: Request, res: Response): void {
  const isReAuthenticationRequired = req.session.user.reauthenticate;

  if (supportReauthentication() && isReAuthenticationRequired) {
    if (isLocked(req.session.user.wrongEmailEnteredLock)) {
      return res.render(BLOCKED_TEMPLATE);
    }
    return res.render(RE_ENTER_EMAIL_TEMPLATE);
  }

  return res.render(ENTER_EMAIL_TEMPLATE);
}

export function enterEmailCreateGet(req: Request, res: Response): void {
  req.session.user.isAccountCreationJourney = true;
  return res.render("enter-email/index-create-account.njk");
}

export function enterEmailPost(
  service: EnterEmailServiceInterface = enterEmailService(),
  checkReauthService: CheckReauthServiceInterface = checkReauthUsersService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.body.email;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    req.session.user.email = email.toLowerCase();
    const reauthenticateJourney = req.session.user.reauthenticate;

    if (supportReauthentication() && reauthenticateJourney) {
      const checkReauth = await checkReauthService.checkReauthUsers(
        sessionId,
        email,
        reauthenticateJourney,
        clientSessionId,
        persistentSessionId,
        req
      );

      if (!checkReauth.success) {
        if (isLocked(req.session.user.wrongEmailEnteredLock)) {
          return res.render(BLOCKED_TEMPLATE);
        }

        switch (checkReauth.data.code) {
          case ERROR_CODES.ACCOUNT_LOCKED:
            return res.render("enter-password/index-sign-in-retry-blocked.njk");

          case ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED:
            return res.redirect(
              req.session.client.redirectUri.concat("?error=login_required")
            );

          case ERROR_CODES.RE_AUTH_CHECK_NO_USER_OR_NO_MATCH:
            return handleBadRequest(req, res, EMAIL_ERROR_KEY);
        }
      }
    }

    const result = await service.userExists(
      sessionId,
      email,
      res.locals.clientSessionId,
      res.locals.persistentSessionId,
      req
    );

    if (!result.success) {
      if (result.data.code === ERROR_CODES.ACCOUNT_LOCKED) {
        return res.render("enter-password/index-sign-in-retry-blocked.njk");
      }
      throw new BadRequestError(result.data.message, result.data.code);
    }

    if (
      result.data.lockoutInformation != null &&
      result.data.lockoutInformation.length > 0
    ) {
      setUpAuthAppLocks(req, result.data.lockoutInformation);
    }

    req.session.user.enterEmailMfaType = result.data.mfaMethodType;
    req.session.user.redactedPhoneNumber = result.data.phoneNumberLastThree;

    const nextState = result.data.doesUserExist
      ? USER_JOURNEY_EVENTS.VALIDATE_CREDENTIALS
      : USER_JOURNEY_EVENTS.ACCOUNT_NOT_FOUND;

    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        nextState,
        null,
        sessionId
      )
    );
  };
}

export function enterEmailCreatePost(
  service: EnterEmailServiceInterface = enterEmailService(),
  notificationService: SendNotificationServiceInterface = sendNotificationService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.body.email.toLowerCase();
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    req.session.user.email = email;

    const userExistsResponse = await service.userExists(
      sessionId,
      email,
      clientSessionId,
      persistentSessionId,
      req
    );

    if (!userExistsResponse.success) {
      throw new BadRequestError(
        userExistsResponse.data.message,
        userExistsResponse.data.code
      );
    }

    if (userExistsResponse.data.doesUserExist) {
      return res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          req.path,
          USER_JOURNEY_EVENTS.ACCOUNT_FOUND_CREATE,
          null,
          sessionId
        )
      );
    }

    const sendNotificationResponse = await notificationService.sendNotification(
      sessionId,
      clientSessionId,
      email,
      NOTIFICATION_TYPE.VERIFY_EMAIL,
      persistentSessionId,
      xss(req.cookies.lng as string),
      req,
      JOURNEY_TYPE.REGISTRATION
    );

    if (!sendNotificationResponse.success) {
      if (
        sendNotificationResponse.data.code ==
        ERROR_CODES.VERIFY_EMAIL_MAX_CODES_SENT
      ) {
        return res.render("security-code-error/index-wait.njk", {
          newCodeLink: getNewCodePath(
            req.query.actionType as SecurityCodeErrorType
          ),
          isAccountCreationJourney: true,
        });
      }
      const path = getErrorPathByCode(sendNotificationResponse.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(
        sendNotificationResponse.data.message,
        sendNotificationResponse.data.code
      );
    }

    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE,
        null,
        sessionId
      )
    );
  };
}
function handleBadRequest(
  req: Request,
  res: Response,
  errorMessageKey: string
) {
  const error = formatValidationError("email", req.t(errorMessageKey));
  return renderBadRequest(res, req, RE_ENTER_EMAIL_TEMPLATE, error);
}

function setUpAuthAppLocks(req: any, lockoutArray: LockoutInformation[]) {
  lockoutArray.forEach(function (lockoutInformation) {
    if (lockoutInformation.lockType == "codeBlock") {
      const lockTime = timestampNSecondsFromNow(
        parseInt(lockoutInformation.lockTTL)
      );
      switch (lockoutInformation.journeyType) {
        case JOURNEY_TYPE.SIGN_IN:
          req.session.user.wrongCodeEnteredLock = lockTime;
          break;
        case JOURNEY_TYPE.PASSWORD_RESET_MFA:
          req.session.user.wrongCodeEnteredPasswordResetMfaLock = lockTime;
          break;
        default:
          break;
      }
    }
  });
}
