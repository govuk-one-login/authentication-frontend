import type { Request, Response } from "express";
import { ORCHESTRATION_ERROR_CODES } from "../../app.constants.js";

export function accountDeletedGet(req: Request, res: Response): void {
  res.render("account-deleted/index.njk");
}

export function accountDeletedPost(req: Request, res: Response): void {
  req.log.info(
    `Account deleted, returning to orchestration to create a new account for session id ${res.locals.sessionId}`
  );
  const orchestrationRedirectUrl = req.session.client.redirectUri.concat(
    `?error=${ORCHESTRATION_ERROR_CODES.ACCOUNT_CREATION_REQUIRED}`
  );

  res.clearCookie("aps");

  req.session.destroy((error) => {
    if (error) {
      req.log.error(`Failed to delete session: ${error}`);
    } else {
      req.log.info("Session destroyed");
    }
    res.redirect(orchestrationRedirectUrl);
  });
}
