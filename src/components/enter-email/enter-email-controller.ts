import { Request, Response } from "express";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../app.constants";
import { ExpressRouteFunc, UserSession } from "../../types";
import { enterEmailService } from "./enter-email-service";
import { EnterEmailServiceInterface } from "./types";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { SendNotificationServiceInterface } from "../common/send-notification/types";
import { sendNotificationService } from "../common/send-notification/send-notification-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import xss from "xss";
import { CheckReauthServiceInterface } from "../check-reauth-users/types";
import { checkReauthUsersService } from "../check-reauth-users/check-reauth-users-service";
import {
  getEmailEnteredWrongBlockDurationInMinutes,
  supportReauthentication,
} from "../../config";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";

export const RE_ENTER_EMAIL_TEMPLATE =
  "enter-email/index-re-enter-email-account.njk";
const ENTER_EMAIL_TEMPLATE = "enter-email/index-existing-account.njk";
const BLOCKED_TEMPLATE =
  "enter-email/index-sign-in-details-entered-too-many-times.njk";
const EMAIL_ERROR_KEY = "pages.reEnterEmailAccount.enterYourEmailAddressError";

export function enterEmailGet(req: Request, res: Response): void {
  const isReAuthenticationRequired = req.session.user.reauthenticate;

  if (supportReauthentication() && isReAuthenticationRequired) {
    if (isUserLockedOut(req.session.user)) {
      return res.render(BLOCKED_TEMPLATE);
    }
    return res.render(RE_ENTER_EMAIL_TEMPLATE);
  }

  return res.render(ENTER_EMAIL_TEMPLATE);
}

export function enterEmailCreateGet(req: Request, res: Response): void {
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
    const isReAuthenticationRequired = req.session.user.reauthenticate;

    if (supportReauthentication() && isReAuthenticationRequired) {
      const checkReauth = await checkReauthService.checkReauthUsers(
        sessionId,
        email,
        req.ip,
        clientSessionId,
        persistentSessionId
      );

      if (!checkReauth.success) {
        if (isUserLockedOut(req.session.user)) {
          return res.render(BLOCKED_TEMPLATE);
        }

        if (
          checkReauth.data.code ===
          ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED
        ) {
          return handleSessionBlocked(req, res);
        }

        if (
          checkReauth.data.code ===
          ERROR_CODES.RE_AUTH_CHECK_NO_USER_OR_NO_MATCH
        ) {
          return handleBadRequest(req, res, EMAIL_ERROR_KEY);
        }
      }
    }

    const result = await service.userExists(
      sessionId,
      email,
      req.ip,
      res.locals.clientSessionId,
      res.locals.persistentSessionId
    );

    if (!result.success) {
      if (result.data.code === ERROR_CODES.ACCOUNT_LOCKED) {
        return res.render("enter-password/index-sign-in-retry-blocked.njk");
      }
      throw new BadRequestError(result.data.message, result.data.code);
    }
    req.session.user.enterEmailMfaType = result.data.mfaMethodType;
    req.session.user.redactedPhoneNumber = result.data.phoneNumberLastThree;
    const nextState = result.data.doesUserExist
      ? USER_JOURNEY_EVENTS.VALIDATE_CREDENTIALS
      : USER_JOURNEY_EVENTS.ACCOUNT_NOT_FOUND;

    return res.redirect(
      getNextPathAndUpdateJourney(req, req.path, nextState, null, sessionId)
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
      req.ip,
      clientSessionId,
      persistentSessionId
    );

    if (!userExistsResponse.success) {
      throw new BadRequestError(
        userExistsResponse.data.message,
        userExistsResponse.data.code
      );
    }

    if (userExistsResponse.data.doesUserExist) {
      return res.redirect(
        getNextPathAndUpdateJourney(
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
      req.ip,
      persistentSessionId,
      xss(req.cookies.lng as string),
      JOURNEY_TYPE.REGISTRATION
    );

    if (!sendNotificationResponse.success) {
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
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.SEND_EMAIL_CODE,
        null,
        sessionId
      )
    );
  };
}

function isUserLockedOut(userSession: UserSession) {
  const lockTimestamp = userSession.wrongEmailEnteredLock;
  return lockTimestamp && new Date() < new Date(lockTimestamp);
}

function lockUser(userSession: UserSession) {
  const lockDurationInMinutes = getEmailEnteredWrongBlockDurationInMinutes();
  userSession.wrongEmailEnteredLock = new Date(
    Date.now() + lockDurationInMinutes * 60000
  ).toUTCString();
}

function handleSessionBlocked(req: Request, res: Response) {
  lockUser(req.session.user);
  return res.render(BLOCKED_TEMPLATE);
}

function handleBadRequest(
  req: Request,
  res: Response,
  errorMessageKey: string
) {
  const error = formatValidationError("email", req.t(errorMessageKey));
  return renderBadRequest(res, req, RE_ENTER_EMAIL_TEMPLATE, error);
}
