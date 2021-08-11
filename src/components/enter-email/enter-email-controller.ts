import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { enterEmailService } from "./enter-email-service";
import { EnterEmailServiceInterface } from "./types";

export function enterEmailGet(req: Request, res: Response): void {
  res.render("enter-email/index.njk");
}

export function enterEmailPost(
  service: EnterEmailServiceInterface = enterEmailService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const email = req.body.email;
    const sessionId = res.locals.sessionId;

    req.session.user.email = email;

    if (await service.userExists(sessionId, email)) {
      return res.redirect(PATH_NAMES.ENTER_PASSWORD);
    }

    await service.sendEmailVerificationNotification(sessionId, email);

    res.redirect(PATH_NAMES.CHECK_YOUR_EMAIL);
  };
}
