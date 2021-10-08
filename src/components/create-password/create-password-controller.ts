import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { createPasswordService } from "./create-password-service";
import { CreatePasswordServiceInterface } from "./types";
import { BadRequestError } from "../../utils/error";
import { getNextPathByState } from "../common/constants";

export function createPasswordGet(req: Request, res: Response): void {
  res.render("create-password/index.njk");
}

export function createPasswordPost(
  service: CreatePasswordServiceInterface = createPasswordService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const result = await service.signUpUser(
      res.locals.sessionId,
      req.session.email,
      req.body.password,
      req.ip
    );

    if (!result.success) {
      throw new BadRequestError(result.message, result.code);
    }

    req.session.backState = result.sessionState;

    return res.redirect(getNextPathByState(result.sessionState));
  };
}
