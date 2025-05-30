import type { Request, Response } from "express";
import { NOTIFICATION_TYPE, PATH_NAMES } from "../../app.constants.js";
import type { VerifyCodeInterface } from "../common/verify-code/types.js";
import { codeService } from "../common/verify-code/verify-code-service.js";
import { verifyCodePost } from "../common/verify-code/verify-code-controller.js";
import type { ExpressRouteFunc, MfaMethod, SmsMfaMethod } from "../../types.js";
import type { SecurityCodeErrorType } from "../common/constants.js";
import { ERROR_CODES } from "../common/constants.js";
import type { AccountRecoveryInterface } from "../common/account-recovery/types.js";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service.js";
import { getJourneyTypeFromUserSession } from "../common/journey/journey.js";
import type { AccountInterventionsInterface } from "../account-intervention/types.js";
import { accountInterventionService } from "../account-intervention/account-intervention-service.js";
import { getNewCodePath } from "../security-code-error/security-code-error-controller.js";
import { isLocked } from "../../utils/lock-helper.js";
import { isUpliftRequired } from "../../utils/request.js";
import { isAccountRecoveryPermitted } from "../common/account-recovery/account-recovery-helper.js";

export const ENTER_MFA_DEFAULT_TEMPLATE_NAME = "enter-mfa/index.njk";
export const UPLIFT_REQUIRED_SMS_TEMPLATE_NAME =
  "enter-mfa/index-2fa-service-uplift-mobile-phone.njk";

export function enterMfaGet(
  acctRecoveryService: AccountRecoveryInterface = accountRecoveryService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    if (isLocked(req.session.user.wrongCodeEnteredLock)) {
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: PATH_NAMES.ENTER_MFA,
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
    const templateName = isUpliftRequired(req)
      ? UPLIFT_REQUIRED_SMS_TEMPLATE_NAME
      : ENTER_MFA_DEFAULT_TEMPLATE_NAME;

    req.session.user.isAccountRecoveryPermitted =
      await isAccountRecoveryPermitted(req, res, acctRecoveryService);

    res.render(templateName, enterMfaTemplateParametersFromRequest(req));
  };
}

export const enterMfaPost = (
  service: VerifyCodeInterface = codeService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService()
): ExpressRouteFunc => {
  return async function (req: Request, res: Response) {
    const template = isUpliftRequired(req)
      ? UPLIFT_REQUIRED_SMS_TEMPLATE_NAME
      : ENTER_MFA_DEFAULT_TEMPLATE_NAME;

    const verifyCodeRequest = verifyCodePost(
      service,
      accountInterventionsService,
      {
        notificationType: NOTIFICATION_TYPE.MFA_SMS,
        template: template,
        validationKey: "pages.enterMfa.code.validationError.invalidCode",
        validationErrorCode: ERROR_CODES.INVALID_MFA_CODE,
        journeyType: getJourneyTypeFromUserSession(req.session.user, {
          includeReauthentication: true,
        }),
        postValidationLocalsProvider: enterMfaTemplateParametersFromRequest,
      }
    );

    return verifyCodeRequest(req, res);
  };
};

export function enterMfaTemplateParametersFromRequest(req: Request): any {
  const activeMfaMethod: SmsMfaMethod = req.session.user.mfaMethods.find(
    (mfaMethod: MfaMethod) =>
      mfaMethod.id === req.session.user.activeMfaMethodId
  );
  const hasMultipleMfaMethods = req.session.user.mfaMethods?.length > 1;

  return {
    phoneNumber: activeMfaMethod.redactedPhoneNumber,
    isAccountRecoveryPermitted: req.session.user.isAccountRecoveryPermitted,
    hasMultipleMfaMethods,
    mfaIssuePath: hasMultipleMfaMethods
      ? PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES
      : PATH_NAMES.MFA_RESET_WITH_IPV,
  };
}
