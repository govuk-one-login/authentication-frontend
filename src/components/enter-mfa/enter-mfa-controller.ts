import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { NOTIFICATION_TYPE, PATH_NAMES, USER_STATE } from "../../app.constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";

const TEMPLATE_NAME = "enter-mfa/index.njk";

export function enterMfaGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    phoneNumber: req.session.user.phoneNumber,
  });
}

export function enterMfaPost(
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const sessionId = req.session.user.id;

    const userState = await service.verifyCode(
      sessionId,
      code,
      NOTIFICATION_TYPE.MFA_SMS
    );

    if (userState == USER_STATE.MFA_CODE_VERIFIED) {
      return res.redirect(PATH_NAMES.AUTH_CODE);
    } else if (userState == USER_STATE.PHONE_NUMBER_CODE_MAX_RETRIES_REACHED) {
      return res.redirect(PATH_NAMES.SECURITY_CODE_EXPIRED);
    }

    const error = formatValidationError(
      "code",
      req.t("pages.enterMfa.code.validationError.invalidCode")
    );

    renderBadRequest(res, req, TEMPLATE_NAME, error);
  };
}
