import { Request, Response } from "express";
import { ExpressRouteFunc } from "src/types";
import xss from "xss";
import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";
import {
  ERROR_CODES,
  getErrorPathByCode,
  pathWithQueryParam,
  SecurityCodeErrorType,
} from "../common/constants";
import { BadRequestError } from "../../utils/error";
import {
  JOURNEY_TYPE,
  NOTIFICATION_TYPE,
  PATH_NAMES,
} from "../../app.constants";
import { verifyCodePost } from "../common/verify-code/verify-code-controller";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";
import { AccountInterventionsInterface } from "../account-intervention/types";
import { accountInterventionService } from "../account-intervention/account-intervention-service";
import { getNewCodePath } from "../security-code-error/security-code-error-controller";
import { isLocked } from "../../utils/lock-helper";
import { getDefaultSmsMfaMethod } from "../../utils/mfa";

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
    return res.render(TEMPLATE_NAME, {
      phoneNumber: getDefaultSmsMfaMethod(req.session.user.mfaMethods)
        ?.redactedPhoneNumber,
      resendCodeLink: RESEND_CODE_LINK,
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
