import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { getNextPathByState } from "../common/constants";

export function landingGet(req: Request, res: Response): void {
  let redirectPath = PATH_NAMES.SIGN_IN_OR_CREATE;

  if (req.query.interrupt) {
    redirectPath = getNextPathByState((req.query.interrupt as string).trim());
  }

  res.redirect(
    appendQueryParam(
      "cookie_consent",
      req.query.cookie_consent as string,
      redirectPath
    )
  );
}

function appendQueryParam(param: string, value: string, url: string) {
  if (!param || !value) {
    return url;
  }

  return `${url}?${param}=${value.trim()}`;
}
