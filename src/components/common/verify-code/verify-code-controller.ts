import { Request, Response } from "express";
import { getErrorPathByCode, getNextPathAndUpdateJourney } from "../constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../../utils/validation";
import { BadRequestError } from "../../../utils/error";
import { VerifyCodeInterface } from "./types";
import { ExpressRouteFunc } from "../../../types";
import { USER_JOURNEY_EVENTS } from "../state-machine/state-machine";
import { JOURNEY_TYPE, NOTIFICATION_TYPE } from "../../../app.constants";
import { support2FABeforePasswordReset } from "../../../config";

interface Config {
  notificationType: NOTIFICATION_TYPE;
  template: string;
  validationKey: string;
  validationErrorCode: number;
  callback?: (req: Request, res: Response) => void;
  journeyType?: JOURNEY_TYPE;
}

export function verifyCodePost(
  service: VerifyCodeInterface,
  options: Config
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.verifyCode(
      sessionId,
      code,
      options.notificationType,
      clientSessionId,
      req.ip,
      persistentSessionId,
      options.journeyType
    );

    if (!result.success) {
      if (result.data.code === options.validationErrorCode) {
        const error = formatValidationError(
          "code",
          req.t(options.validationKey)
        );
        return renderBadRequest(res, req, options.template, error);
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
      case NOTIFICATION_TYPE.VERIFY_CHANGE_HOW_GET_SECURITY_CODES:
        nextEvent = USER_JOURNEY_EVENTS.EMAIL_SECURITY_CODES_CODE_VERIFIED;
        break;
      default:
        throw new Error("Unknown notification type");
    }

    res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        nextEvent,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          isConsentRequired: req.session.user.isConsentRequired,
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
          support2FABeforePasswordReset: support2FABeforePasswordReset(),
          mfaMethodType: req.session.user.enterEmailMfaType,
          isPasswordChangeRequired: req.session.user.isPasswordChangeRequired,
        },
        res.locals.sessionId
      )
    );
  };
}
