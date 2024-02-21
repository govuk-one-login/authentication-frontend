import { Request, Response } from "express";
import { ExpressRouteFunc } from "src/types";
import xss from "xss";
import { MfaServiceInterface } from "../common/mfa/types";
import { mfaService } from "../common/mfa/mfa-service";
import {
  ERROR_CODES,
  getErrorPathByCode,
  pathWithQueryParam,
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

    if (
      req.session.user.wrongCodeEnteredLock &&
      new Date().getTime() <
        new Date(req.session.user.wrongCodeEnteredLock).getTime()
    ) {
      return res.render(
        "security-code-error/index-security-code-entered-exceeded.njk",
        {
          newCodeLink: PATH_NAMES.RESET_PASSWORD_2FA_SMS,
        }
      );
    }

    const mfaResponse = await mfaCodeService.sendMfaCode(
      sessionId,
      clientSessionId,
      email,
      req.ip,
      persistentSessionId,
      false,
      xss(req.cookies.lng as string),
      JOURNEY_TYPE.PASSWORD_RESET_MFA
    );

    if (!mfaResponse.success) {
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
      phoneNumber: req.session.user.redactedPhoneNumber,
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
