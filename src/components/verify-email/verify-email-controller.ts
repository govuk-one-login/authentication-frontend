import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { NOTIFICATION_TYPE, PATH_NAMES, USER_STATE } from "../../app.constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { VerifyCodeInterface } from "../common/verify-code/types";
import { codeService } from "../common/verify-code/verify-code-service";

const TEMPLATE_NAME = "verify-email/index.njk";

export function verifyEmailGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
  });
}

export function verifyEmailPost(
  service: VerifyCodeInterface = codeService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const sessionId = req.session.user.id;

    const userState = await service.verifyCode(
      sessionId,
      code,
      NOTIFICATION_TYPE.VERIFY_EMAIL
    );

    if (userState === USER_STATE.EMAIL_CODE_VERIFIED) {
      return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
    }

    const error = formatValidationError(
      "code",
      req.t("pages.verifyEmail.code.validationError.invalidCode")
    );

    renderBadRequest(res, req, TEMPLATE_NAME, error);
  };
}
