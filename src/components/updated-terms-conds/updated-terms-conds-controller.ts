import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { ExpressRouteFunc } from "../../types";
import { updateTermsAndCondsService } from "./updated-terms-conds-service";
import {
  ClientInfoResponse,
  UpdateTermsAndCondsServiceInterface,
} from "./types";

export function updatedTermsCondsGet(
  service: UpdateTermsAndCondsServiceInterface = updateTermsAndCondsService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const sessionId = res.locals.sessionId;
    const clientSessionId = res.locals.clientSessionId;
    const clientInfo: ClientInfoResponse = await service.clientInfo(
      sessionId,
      clientSessionId
    );
    req.session.redirectUri = clientInfo.redirectUri;

    res.render("updated-terms-conds/index.njk");
  };
}

export function updatedTermsCondsPost(
  service: UpdateTermsAndCondsServiceInterface = updateTermsAndCondsService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const updatedTermsAndCondsValue = true;
    const { email } = req.session.user;
    const sessionId = res.locals.sessionId;
    const redirectUri = req.session.redirectUri;
    const acceptOrReject = req.body.acceptOrReject;

    if (acceptOrReject === "reject") {
      return res.redirect(
        redirectUri + "?error_code=rejectedTermsAndConditions"
      );
    }

    if (acceptOrReject === "accept") {
      if (
        await service.updateProfile(sessionId, email, updatedTermsAndCondsValue)
      ) {
        res.redirect(PATH_NAMES.AUTH_CODE);
      } else {
        throw new Error("Unable to update user profile");
      }
    }
  };
}
