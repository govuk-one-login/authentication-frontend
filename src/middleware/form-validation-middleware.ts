import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { HTTP_STATUS_CODES } from "../app.constants";

const validationErrorFormatter = ({
  msg,
  param,
}: {
  msg: string;
  param: string;
}): any => {
  return {
    text: msg,
    href: `#${param}`,
  };
};

export function validateBodyMiddleware(template: string) {
  return (req: Request, res: Response, next: NextFunction): any => {
    const errors = validationResult(req)
      .formatWith(validationErrorFormatter)
      .mapped();

    if (Object.keys(errors).length !== 0) {
      res.status(HTTP_STATUS_CODES.BAD_REQUEST);
      return res.render(template, {
        errors,
        errorList: Object.values(errors),
        ...req.body,
        language: req.i18n.language,
      });
    }
    next();
  };
}
