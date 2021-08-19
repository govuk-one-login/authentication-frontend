import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { shareInfoService } from "./share-info-service";
import { PATH_NAMES } from "../../app.constants";
import { ShareInfoServiceInterface } from "./types";

export function shareInfoGet(
  service: ShareInfoServiceInterface = shareInfoService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const sessionId = res.locals.sessionId;
    const clientSessionId = res.locals.clientSessionId;
    const clientInfo = await service.clientInfo(sessionId, clientSessionId);
    const prettyScopes = mapScopes(clientInfo.scopes);

    res.render("share-info/index.njk", { clientInfo, prettyScopes });
  };
}

export function shareInfoPost(
  service: ShareInfoServiceInterface = shareInfoService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const consentValue = req.body.consentValue;
    const { email } = req.session.user;
    const sessionId = res.locals.sessionId;
    const clientSessionId = res.locals.clientSessionId;

    if (
      await service.updateProfile(
        sessionId,
        clientSessionId,
        email,
        consentValue
      )
    ) {
      res.redirect(PATH_NAMES.AUTH_CODE);
    } else {
      throw new Error("Unable to update user profile");
    }
  };
}

function mapScopes(scopes: string[]) {
  const returnScopes: any[] = [];
  scopes.forEach(function (item) {
    if (item === "email") {
      returnScopes.push("email address");
    }
    if (item === "phone") {
      returnScopes.push("phone number");
    }
  });
  return returnScopes;
}
