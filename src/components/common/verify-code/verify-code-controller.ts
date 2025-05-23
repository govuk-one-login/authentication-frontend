import type { Request, Response } from "express";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../constants.js";
import {
  formatValidationError,
  renderBadRequest,
} from "../../../utils/validation.js";
import { BadRequestError } from "../../../utils/error.js";
import type { VerifyCodeInterface } from "./types.js";
import type { ExpressRouteFunc } from "../../../types.js";
import { USER_JOURNEY_EVENTS } from "../state-machine/state-machine.js";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import { supportAccountInterventions } from "../../../config.js";
import type { AccountInterventionsInterface } from "../../account-intervention/types.js";
import { isSuspendedWithoutUserActions } from "../../../utils/interventions.js";
import { isReauth } from "../../../utils/request.js";
interface Config {
  notificationType: NOTIFICATION_TYPE;
  template: string;
  validationKey: string;
  validationErrorCode: number;
  isOnForcedPasswordResetJourney?: boolean;
  callback?: (req: Request, res: Response) => void;
  journeyType?: JOURNEY_TYPE;
  postValidationLocalsProvider?: (req: Request) => Record<string, unknown>;
}

export function verifyCodePost(
  service: VerifyCodeInterface,
  accountInterventionsService: AccountInterventionsInterface,
  options: Config
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.session.user.email.toLowerCase();
    const code = req.body["code"];
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.verifyCode(
      sessionId,
      code,
      options.notificationType,
      clientSessionId,
      persistentSessionId,
      req,
      req.session.user.activeMfaMethodId,
      options.journeyType
    );

    if (!result.success) {
      if (result.data.code === options.validationErrorCode) {
        const error = formatValidationError(
          "code",
          req.t(options.validationKey)
        );
        if (options.postValidationLocalsProvider) {
          return renderBadRequest(
            res,
            req,
            options.template,
            error,
            options.postValidationLocalsProvider(req)
          );
        } else {
          return renderBadRequest(res, req, options.template, error);
        }
      }

      if (isReauth(req)) {
        if (
          result.data.code ===
            ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED ||
          result.data.code === ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES ||
          result.data.code ===
            ERROR_CODES.RE_AUTH_SIGN_IN_DETAILS_ENTERED_EXCEEDED
        ) {
          return res.redirect(
            req.session.client.redirectUri.concat("?error=login_required")
          );
        }
      }

      if (
        ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES ===
          result.data.code &&
        req.session.user.isAccountCreationJourney
      ) {
        req.session.user.isVerifyEmailCodeResendRequired = true;
      }
      const path = getErrorPathByCode(result.data.code);

      if (path) {
        return res.redirect(path);
      }

      throw new BadRequestError(result.data.message, result.data.code);
    }

    req.session.user.isAccountPartCreated = false;

    if (options.callback) {
      return options.callback(req, res);
    }

    let nextEvent;

    switch (options.notificationType) {
      case NOTIFICATION_TYPE.VERIFY_EMAIL:
        nextEvent = USER_JOURNEY_EVENTS.EMAIL_CODE_VERIFIED;
        break;
      case NOTIFICATION_TYPE.MFA_SMS:
        nextEvent = USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED;
        break;
      case NOTIFICATION_TYPE.RESET_PASSWORD_WITH_CODE:
        nextEvent = USER_JOURNEY_EVENTS.RESET_PASSWORD_CODE_VERIFIED;
        break;
      default:
        throw new Error("Unknown notification type");
    }
    if (
      supportAccountInterventions() &&
      !req.session.user.withinForcedPasswordResetJourney
    ) {
      if (
        nextEvent === USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED &&
        options.journeyType === JOURNEY_TYPE.PASSWORD_RESET_MFA
      ) {
        const accountInterventionsResponse =
          await accountInterventionsService.accountInterventionStatus(
            sessionId,
            email,
            clientSessionId,
            persistentSessionId,
            req
          );
        if (accountInterventionsResponse.data.blocked) {
          nextEvent = USER_JOURNEY_EVENTS.PERMANENTLY_BLOCKED_INTERVENTION;
        } else if (accountInterventionsResponse.data.passwordResetRequired) {
          if (options.journeyType !== JOURNEY_TYPE.PASSWORD_RESET_MFA) {
            nextEvent = USER_JOURNEY_EVENTS.PASSWORD_RESET_INTERVENTION;
          }
        } else if (
          isSuspendedWithoutUserActions(accountInterventionsResponse.data)
        ) {
          nextEvent = USER_JOURNEY_EVENTS.TEMPORARILY_BLOCKED_INTERVENTION;
        }
      }
    }

    res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        nextEvent,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
          mfaMethodType: req.session.user.enterEmailMfaType,
          isPasswordChangeRequired: req.session.user.isPasswordChangeRequired,
          isOnForcedPasswordResetJourney:
            req.path === PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL &&
            req.session.user.withinForcedPasswordResetJourney,
        },
        res.locals.sessionId
      )
    );
  };
}
