import { VerifyMfaCodeInterface } from "../../enter-authenticator-app-code/types";
import { ExpressRouteFunc } from "../../../types";
import { Request, Response } from "express";
import { MFA_METHOD_TYPE } from "../../../app.constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../../utils/validation";
import { getErrorPathByCode, getNextPathAndUpdateJourney } from "../constants";
import { BadRequestError } from "../../../utils/error";
import { USER_JOURNEY_EVENTS } from "../state-machine/state-machine";

interface Config {
  methodType: MFA_METHOD_TYPE;
  registration: boolean;
  template: string;
  validationKey: string;
  validationErrorCode: number;
  callback?: (req: Request, res: Response) => void;
}

export function verifyMfaCodePost(
  service: VerifyMfaCodeInterface,
  options: Config
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    let profileInformation;

    if (options.registration && options.methodType === MFA_METHOD_TYPE.SMS) {
      profileInformation = req.session.user.phoneNumber;
    }

    const result = await service.verifyMfaCode(
      options.methodType,
      code,
      options.registration,
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId,
      profileInformation
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

    if (options.callback) {
      return options.callback(req, res);
    }

    res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.AUTH_APP_CODE_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
          isConsentRequired: req.session.user.isConsentRequired,
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
        },
        res.locals.sessionId
      )
    );
  };
}
