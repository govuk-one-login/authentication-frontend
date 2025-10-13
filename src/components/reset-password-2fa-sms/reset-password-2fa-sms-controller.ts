import type { Request, Response } from "express";
import type { ExpressRouteFunc, SmsMfaMethod } from "src/types.js";
import type { SecurityCodeErrorType } from "../common/constants.js";
import { ERROR_CODES, pathWithQueryParam } from "../common/constants.js";
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

export function resetPassword2FASmsGet(): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
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

    const { mfaMethods } = req.session.user;

    const activeMfaMethod = req.session.user.mfaMethods.find(
      (mfaMethod) => mfaMethod.id === req.session.user.activeMfaMethodId
    ) as SmsMfaMethod | undefined;

    const hasMultipleMfaMethods = mfaMethods?.length > 1;
    const chooseMfaMethodHref = PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES;

    return res.render(TEMPLATE_NAME, {
      phoneNumber: activeMfaMethod?.redactedPhoneNumber,
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
