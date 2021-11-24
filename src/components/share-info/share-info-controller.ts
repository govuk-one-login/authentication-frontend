import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";

import { BadRequestError } from "../../utils/error";
import { getNextPathByState } from "../common/constants";
import { ClientInfoServiceInterface } from "../common/client-info/types";
import { UpdateProfileServiceInterface } from "../common/update-profile/types";
import { updateProfileService } from "../common/update-profile/update-profile-service";
import { clientInfoService } from "../common/client-info/client-info-service";

export function shareInfoGet(
  service: ClientInfoServiceInterface = clientInfoService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const clientInfoResponse = await service.clientInfo(
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId
    );

    const prettyScopes = mapScopes(clientInfoResponse.data.scopes);

    res.render("share-info/index.njk", {
      clientName: clientInfoResponse.data.clientName,
      prettyScopes,
    });
  };
}

export function shareInfoPost(
  service: UpdateProfileServiceInterface = updateProfileService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const consentValue = req.body.consentValue;
    const { email } = req.session;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.updateProfile(
      sessionId,
      clientSessionId,
      email,
      {
        profileInformation: consentValue,
        updateProfileType: "CAPTURE_CONSENT",
      },
      req.ip,
      persistentSessionId
    );

    if (!result.success) {
      throw new BadRequestError(result.message, result.code);
    }

    res.redirect(getNextPathByState(result.sessionState));
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
