import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { PATH_NAMES } from "../../app.constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { verifyEmailService } from "./verify-email-service";
import { VerifyEmailServiceInterface } from "./types";

const TEMPLATE_NAME = "verify-email/index.njk";

export function verifyEmailGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    email: req.session.user.email,
  });
}

export function verifyEmailPost(
  service: VerifyEmailServiceInterface = verifyEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const sessionId = req.session.user.id;

    const isValidCode = await service.verifyEmailCode(sessionId, code);

    if (isValidCode) {
      return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD);
    }

    const error = formatValidationError(
      "code",
      req.t("pages.verifyEmail.code.validationError.invalidCode")
    );

    renderBadRequest(res, req, TEMPLATE_NAME, error);
  };
}
