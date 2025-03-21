import { Request, Response } from "express";
import {
  NOTIFICATION_TYPE,
  PATH_NAMES,
  MFA_METHOD_TYPE,
} from "../../app.constants";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { ExpressRouteFunc } from "../../types";
import {
  ERROR_CODES,
  pathWithQueryParam,
  SecurityCodeErrorType,
} from "../common/constants";
import {
  routeUsersToNewIpvJourney,
  supportAccountRecovery,
  supportMfaResetWithIpv,
} from "../../config";
import { AccountRecoveryInterface } from "../common/account-recovery/types";
import { accountRecoveryService } from "../common/account-recovery/account-recovery-service";
import { BadRequestError } from "../../utils/error";
import { getJourneyTypeFromUserSession } from "../common/journey/journey";
import { AccountInterventionsInterface } from "../account-intervention/types";
import { accountInterventionService } from "../account-intervention/account-intervention-service";
import { getNewCodePath } from "../security-code-error/security-code-error-controller";
import { isLocked } from "../../utils/lock-helper";
import { isUpliftRequired } from "../../utils/request";

export const ENTER_MFA_DEFAULT_TEMPLATE_NAME = "enter-mfa/index.njk";
export const UPLIFT_REQUIRED_SMS_TEMPLATE_NAME =
  "enter-mfa/index-2fa-service-uplift-mobile-phone.njk";

export function enterMfaGet(
  acctRecoveryService: AccountRecoveryInterface = accountRecoveryService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const isAccountRecoveryEnabledForEnvironment = supportAccountRecovery();

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

    if (!isAccountRecoveryEnabledForEnvironment) {
      return res.render(templateName, {
        phoneNumber: req.session.user.redactedPhoneNumber,
        supportAccountRecovery: false,
      });
    }

    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const accountRecoveryResponse = await acctRecoveryService.accountRecovery(
      sessionId,
      clientSessionId,
      email,
      persistentSessionId,
      req
    );

    if (!accountRecoveryResponse.success) {
      throw new BadRequestError(
        accountRecoveryResponse.data.message,
        accountRecoveryResponse.data.code
      );
    }

    req.session.user.isAccountRecoveryPermitted =
      accountRecoveryResponse.data.accountRecoveryPermitted;

    const routeUserViaIpvReset =
      supportMfaResetWithIpv() && routeUsersToNewIpvJourney();

    const mfaResetPath = routeUserViaIpvReset
      ? PATH_NAMES.MFA_RESET_WITH_IPV
      : pathWithQueryParam(
          PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES,
          "type",
          MFA_METHOD_TYPE.SMS
        );

    res.render(templateName, {
      phoneNumber: req.session.user.redactedPhoneNumber,
      supportAccountRecovery: req.session.user.isAccountRecoveryPermitted,
      mfaResetPath: mfaResetPath,
      routeUserViaIpvReset: routeUserViaIpvReset,
    });
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
      }
    );

    return verifyCodeRequest(req, res);
  };
};
