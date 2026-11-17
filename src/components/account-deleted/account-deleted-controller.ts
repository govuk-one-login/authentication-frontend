import type { Request, Response } from "express";
import { ORCHESTRATION_ERROR_CODES } from "../../app.constants.js";

export function accountDeletedGet(req: Request, res: Response): void {
  res.render("account-deleted/index.njk");
}

export function accountDeletedPost(req: Request, res: Response): void {
  req.log.info(
    `Account deleted, returning to orchestration to create a new account for session id ${res.locals.sessionId}`
  );
  res.clearCookie("aps")
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error')
    }

    return res.redirect(
      req.session.client.redirectUri.concat(
        `?error=${ORCHESTRATION_ERROR_CODES.SFAD_ERROR}`
      )
    );
  })
}
