import { body, ValidationChain } from "express-validator";
import { containsNumbersOnly } from "../../../utils/strings.js";
export function removeWhiteSpace(value: string): string {
  const re = /[\r\n\t\f\v\s]/g;

  return value.replace(re, "");
}

export function whitespaceSanitizer(): ValidationChain {
  return body("code").customSanitizer(removeWhiteSpace);
}

export function validateCode(validationMessageKeys: {
  requiredKey: string;
  maxLengthKey: string;
  minLengthKey: string;
  numbersOnlyKey: string;
}): ValidationChain {
  return body("code")
    .notEmpty()
    .withMessage((value, { req }) => {
      return req.t(validationMessageKeys.requiredKey, {
        value,
      });
    })
    .isLength({ max: 6 })
    .withMessage((value, { req }) => {
      return req.t(validationMessageKeys.maxLengthKey, {
        value,
      });
    })
    .isLength({ min: 6 })
    .withMessage((value, { req }) => {
      return req.t(validationMessageKeys.minLengthKey, {
        value,
      });
    })
    .custom((value, { req }) => {
      if (!containsNumbersOnly(value)) {
        throw new Error(req.t(validationMessageKeys.numbersOnlyKey));
      }
      return true;
    });
}
