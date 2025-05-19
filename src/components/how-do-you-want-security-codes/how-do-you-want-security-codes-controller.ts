import type { Request, Response } from "express";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants.js";
import type { ExpressRouteFunc, MfaMethod } from "../../types.js";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import type { MfaServiceInterface } from "../common/mfa/types.js";
import { mfaService } from "../common/mfa/mfa-service.js";
import xss from "xss";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import { BadRequestError } from "../../utils/error.js";

export function sortMfaMethodsBackupFirst(
  mfaMethods: MfaMethod[]
): MfaMethod[] {
  return mfaMethods
    .slice()
    .sort((a, b) => a.priority.localeCompare(b.priority, "en"));
}

export function howDoYouWantSecurityCodesGet(
  req: Request,
  res: Response
): void {
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
          if (result.data.code === ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED) {
            return res.render("security-code-error/index-wait.njk");
          }

          if (result.data.code === ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES) {
            return res.render(
              "security-code-error/index-security-code-entered-exceeded.njk",
              {
                show2HrScreen: true,
                contentId: "727a0395-cc00-48eb-a411-bfe9d8ac5fc8",
              }
            );
          }

          const path = getErrorPathByCode(result.data.code);

          if (path) {
            return res.redirect(path);
          }

          throw new BadRequestError(result.data.message, result.data.code);
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
