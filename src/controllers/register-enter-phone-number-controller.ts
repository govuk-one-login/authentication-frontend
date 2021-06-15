import { Request, Response } from "express";
import { body } from "express-validator";
import {validateBodyMiddleware} from "../middleware/form-validation-middleware";

const ENTER_PHONE_NUMBER_TEMPLATE: string = "enter-phone-number.html";

export function validateEnterPhoneNumberRequest() {
  return [
    body("phoneNumber")
      .trim()
      .notEmpty()
      .withMessage((value, { req }) => {
        return req.t(
          "pages.enterPhoneNumber.phoneNumber.validationError.required",
          { value }
        );
      }),
      validateBodyMiddleware(ENTER_PHONE_NUMBER_TEMPLATE)
  ];
}

export function enterPhoneNumberGet(req: Request, res: Response): void {
  res.render(ENTER_PHONE_NUMBER_TEMPLATE);
}
