import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { NOTIFICATION_TYPE, PATH_NAMES, USER_STATE } from "../../app.constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";

const TEMPLATE_NAME = "check-your-email/index.njk";

export function checkYourEmailGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
  });
}

export function checkYourEmailPost(
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const sessionId = res.locals.sessionId;

    const userState = await service.verifyCode(
      sessionId,
      code,
      NOTIFICATION_TYPE.VERIFY_EMAIL
    );

    if (userState === USER_STATE.EMAIL_CODE_VERIFIED) {
      return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
    } else if (userState === USER_STATE.EMAIL_CODE_MAX_RETRIES_REACHED) {
      return res.redirect(PATH_NAMES.SECURITY_CODE_EXPIRED);
    } else {
      const error = formatValidationError(
        "code",
        req.t("pages.checkYourEmail.code.validationError.invalidCode")
      );

      return renderBadRequest(res, req, TEMPLATE_NAME, error);
    }
  };
}
