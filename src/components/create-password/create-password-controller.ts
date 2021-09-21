import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { createPasswordService } from "./create-password-service";
import { CreatePasswordServiceInterface } from "./types";

export function createPasswordGet(req: Request, res: Response): void {
  res.render("create-password/index.njk");
}

export function createPasswordPost(
  service: CreatePasswordServiceInterface = createPasswordService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    await service.signUpUser(
      res.locals.sessionId,
      req.session.user.email,
      req.body.password
    );

    res.redirect(PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER);
  };
}
