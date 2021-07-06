import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { PATH_NAMES } from "../../app.constants";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { CheckYourPhoneNumberService } from "./types";
import { checkYourPhoneService } from "./check-your-phone-service";

const TEMPLATE_NAME = "check-your-phone/index.njk";

export function checkYourPhoneGet(req: Request, res: Response): void {
  res.render(TEMPLATE_NAME, {
    phoneNumber: req.session.user.phoneNumber,
  });
}

export function checkYourPhonePost(
  service: CheckYourPhoneNumberService = checkYourPhoneService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const code = req.body["code"];
    const sessionId = req.session.user.id;

    const isValidCode = await service.verifyPhoneNumber(sessionId, code);

    if (isValidCode) {
      return res.redirect(PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL);
    }

    const error = formatValidationError(
      "code",
      req.t("pages.checkYourPhone.code.validationError.invalidCode")
    );

    renderBadRequest(res, req, TEMPLATE_NAME, error);
  };
}
