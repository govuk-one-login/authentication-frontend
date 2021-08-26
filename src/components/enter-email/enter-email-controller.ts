import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { enterEmailService } from "./enter-email-service";
import { EnterEmailServiceInterface } from "./types";

export function enterEmailGet(req: Request, res: Response): void {
  if (req.session.user.createAccount) {
    return res.render("enter-email/enter-email-create-account.njk");
  }
  return res.render("enter-email/enter-email-existing-account.njk");
}

export function enterEmailPost(
  service: EnterEmailServiceInterface = enterEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.body.email;
    const sessionId = res.locals.sessionId;
    req.session.user.email = email;

    if (await service.userExists(sessionId, email)) {
      res.redirect(PATH_NAMES.ENTER_PASSWORD);
    }

    return res.redirect(PATH_NAMES.ACCOUNT_NOT_FOUND);
  };
}

export function enterEmailCreatePost(
  service: EnterEmailServiceInterface = enterEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.body.email;
    const sessionId = res.locals.sessionId;

    req.session.user.email = email;
    const hasAccount = await service.userExists(sessionId, email);

    if (hasAccount) {
      res.redirect("/enter-password-account-exists");
    } else {
      await service.sendEmailVerificationNotification(sessionId, email);
      res.redirect(PATH_NAMES.CHECK_YOUR_EMAIL);
    }
  };
}
