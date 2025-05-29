import type { Request, Response } from "express";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants.js";
import type { ExpressRouteFunc, MfaMethod } from "../../types.js";
import { getNextPathAndUpdateJourney } from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import type { MfaServiceInterface } from "../common/mfa/types.js";
import { mfaService } from "../common/mfa/mfa-service.js";
import xss from "xss";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import { BadRequestError } from "../../utils/error.js";
import { handleSendMfaCodeError } from "../../utils/send-mfa-code-error-helper.js";

export function sortMfaMethodsBackupFirst(mfaMethods: MfaMethod[]): MfaMethod[] {
  return mfaMethods.slice().sort((a, b) => a.priority.localeCompare(b.priority, "en"));
}

export function howDoYouWantSecurityCodesGet(req: Request, res: Response): void {
  const { isPasswordResetJourney } = req.session.user;
  const supportMfaReset = !isPasswordResetJourney;

  res.render("how-do-you-want-security-codes/index.njk", {
    mfaResetLink: PATH_NAMES.MFA_RESET_WITH_IPV,
    mfaMethods: sortMfaMethodsBackupFirst(req.session.user.mfaMethods || []),
    supportMfaReset,
  });
}

export function howDoYouWantSecurityCodesPost(
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const mfaMethodId = req.body["mfa-method-id"];
    const selectedMethod = req.session.user.mfaMethods.find(
      (method: MfaMethod) => method.id === mfaMethodId
    );

    if (selectedMethod === undefined) {
      throw new BadRequestError("No MFA methods found", 500);
    }

    if (selectedMethod.type === MFA_METHOD_TYPE.SMS) {
      if (mfaMethodId !== req.session.user.activeMfaMethodId) {
        req.session.user.activeMfaMethodId = mfaMethodId;
        const { email } = req.session.user;
        const { sessionId, clientSessionId, persistentSessionId } = res.locals;

        const result = await mfaCodeService.sendMfaCode(
          sessionId,
          clientSessionId,
          email,
          persistentSessionId,
          false,
          xss(req.cookies.lng as string),
          req,
          req.session.user.activeMfaMethodId,
          getJourneyTypeFromUserSession(req.session.user, {
            includeReauthentication: true,
          })
        );

        if (!result.success) {
          return handleSendMfaCodeError(result, res);
        }
      }

      return res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          req.path,
          USER_JOURNEY_EVENTS.SELECT_SMS_MFA_METHOD,
          null,
          res.locals.sessionId
        )
      );
    }

    if (selectedMethod.type === MFA_METHOD_TYPE.AUTH_APP) {
      return res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          req.path,
          USER_JOURNEY_EVENTS.SELECT_AUTH_APP_MFA_METHOD,
          null,
          res.locals.sessionId
        )
      );
    }

    throw new BadRequestError("MFA method type does not exist", 500);
  };
}
