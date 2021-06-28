import { Response, Request } from "express";
import { HTTP_STATUS_CODES } from "../app.constants";

export function renderBadRequest(
  res: Response,
  req: Request,
  template: string,
  errors: any
): void {
  res.status(HTTP_STATUS_CODES.BAD_REQUEST);

  res.render(template, {
    errors,
    errorList: Object.values(errors),
    ...req.body,
    language: req.i18n.language,
  });
}
