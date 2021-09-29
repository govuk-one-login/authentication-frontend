import { Request, Response } from "express";
import { PATH_NAMES, SERVICE_TYPE } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { accountNotFoundService } from "./account-not-found-service";
import { AccountNotFoundServiceInterface } from "./types";

export function accountNotFoundGet(req: Request, res: Response): void {
  const serviceType = req.session.serviceType;
  if (serviceType !== undefined && serviceType === SERVICE_TYPE.OPTIONAL) {
    res.render("account-not-found/account-not-found-optional.njk");
  } else {
    res.render("account-not-found/account-not-found-mandatory.njk", {
      email: req.session.user.email,
    });
  }
}

export function accountNotFoundPost(
  service: AccountNotFoundServiceInterface = accountNotFoundService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.session.user.email;
    const sessionId = res.locals.sessionId;
    req.session.user.createAccount = true;

    await service.sendEmailVerificationNotification(sessionId, email, req.ip);
    res.redirect(PATH_NAMES.CHECK_YOUR_EMAIL);
  };
}
