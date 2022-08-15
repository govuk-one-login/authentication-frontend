import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import {
  supportInternationalNumbers,
  supportLanguageCY,
  supportMFAOptions,
} from "../../config";

export function signInOrCreateGet(req: Request, res: Response): void {
  res.render("sign-in-or-create/index.njk", {
    serviceType: req.session.client.serviceType,
    supportMFAOptions: supportMFAOptions() ? true : null,
    supportInternationalNumbers: supportInternationalNumbers() ? true : null,
    supportLanguageCY: supportLanguageCY() ? true : null,
  });
}

export function signInOrCreatePost(req: Request, res: Response): void {
  res.redirect(
    getNextPathAndUpdateJourney(
      req,
      req.path,
      req.body.optionSelected === "create"
        ? USER_JOURNEY_EVENTS.CREATE_NEW_ACCOUNT
        : USER_JOURNEY_EVENTS.SIGN_IN,
      null,
      res.locals.sessionId
    )
  );
}
