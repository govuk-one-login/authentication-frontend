import type { Request, Response } from "express";
import type { ExpressRouteFunc, MfaMethod } from "src/types.js";
import xss from "xss";
import type { MfaServiceInterface } from "../common/mfa/types.js";
import { mfaService } from "../common/mfa/mfa-service.js";
import type { SecurityCodeErrorType } from "../common/constants.js";
import {
  ERROR_CODES,
  getErrorPathByCode,
  pathWithQueryParam,
} from "../common/constants.js";
import { BadRequestError } from "../../utils/error.js";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../app.constants.js";
import { verifyCodePost } from "../common/verify-code/verify-code-controller.js";
import type { VerifyCodeInterface } from "../common/verify-code/types.js";
import { codeService } from "../common/verify-code/verify-code-service.js";
import type { AccountInterventionsInterface } from "../account-intervention/types.js";
import { accountInterventionService } from "../account-intervention/account-intervention-service.js";
import { getNewCodePath } from "../security-code-error/security-code-error-controller.js";
import { isLocked } from "../../utils/lock-helper.js";

const TEMPLATE_NAME = "reset-password-2fa-sms/index.njk";
const RESEND_CODE_LINK = pathWithQueryParam(
  PATH_NAMES.RESEND_MFA_CODE,
  "isResendCodeRequest",
  "true"
);

export function resetPassword2FASmsGet(
  mfaCodeService: MfaServiceInterface = mfaService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    if (isLocked(req.session.user.wrongCodeEnteredLock)) {
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: PATH_NAMES.RESET_PASSWORD_2FA_SMS,
          show2HrScreen: true,
        }
      );
    }
    if (isLocked(req.session.user.codeRequestLock)) {
      return res.render("security-code-error/index-wait.njk", {
        newCodeLink: getNewCodePath(
          req.query.actionType as SecurityCodeErrorType
        ),
        isAccountCreationJourney: false,
      });
    }
    const mfaResponse = await mfaCodeService.sendMfaCode(
      sessionId,
      clientSessionId,
      email,
      persistentSessionId,
      false,
      xss(req.cookies.lng as string),
      req,
      req.session.user.activeMfaMethodId,
      JOURNEY_TYPE.PASSWORD_RESET_MFA
    );

    if (!mfaResponse.success) {
      if (mfaResponse.data.code == ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED) {
        return res.render("security-code-error/index-wait.njk", {
          newCodeLink: getNewCodePath(
            req.query.actionType as SecurityCodeErrorType
          ),
          isAccountCreationJourney: false,
        });
      }
      if (mfaResponse.data.code == ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES) {
        return res.render(
          "security-code-error/index-security-code-entered-exceeded.njk",
          {
            newCodeLink: getNewCodePath(
              req.query.actionType as SecurityCodeErrorType
            ),
            show2HrScreen: true,
            isAccountCreationJourney: false,
          }
        );
      }
      const path = getErrorPathByCode(mfaResponse.data.code);
      if (path) {
        return res.redirect(path);
      }
      throw new BadRequestError(
        mfaResponse.data.message,
        mfaResponse.data.code
      );
    }

    const { mfaMethods } = req.session.user;

    const phoneNumber = req.session.user.mfaMethods.find(
      (mfaMethod: MfaMethod) =>
        mfaMethod.id === req.session.user.activeMfaMethodId
    )?.redactedPhoneNumber;
    const hasMultipleMfaMethods = mfaMethods?.length > 1;
    const chooseMfaMethodHref = PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES;

    return res.render(TEMPLATE_NAME, {
      phoneNumber,
      resendCodeLink: RESEND_CODE_LINK,
      hasMultipleMfaMethods,
      chooseMfaMethodHref,
    });
  };
}
export function resetPassword2FASmsPost(
  service: VerifyCodeInterface = codeService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService()
): ExpressRouteFunc {
  return verifyCodePost(service, accountInterventionsService, {
    notificationType: NOTIFICATION_TYPE.MFA_SMS,
    template: TEMPLATE_NAME,
    validationKey: "pages.passwordResetMfaSms.code.validationError.invalidCode",
    validationErrorCode: ERROR_CODES.INVALID_MFA_CODE,
    journeyType: JOURNEY_TYPE.PASSWORD_RESET_MFA,
  });
}
