import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";

import { BadRequestError } from "../../utils/error";
import {
  UpdateProfileServiceInterface,
  UpdateType,
} from "../common/update-profile/types";
import { updateProfileService } from "../common/update-profile/update-profile-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { getNextPathAndUpdateJourney } from "../common/constants";

export function shareInfoGet(req: Request, res: Response): void {
  const prettyScopes = mapScopes(req.session.client.scopes);

  res.render("share-info/index.njk", {
    clientName: req.session.client.name,
    prettyScopes,
  });
}

export function shareInfoPost(
  service: UpdateProfileServiceInterface = updateProfileService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const consentValue = req.body.consentValue;
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.updateProfile(
      sessionId,
      clientSessionId,
      email,
      {
        profileInformation: consentValue,
        updateProfileType: UpdateType.CAPTURE_CONSENT,
      },
      req.ip,
      persistentSessionId
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.CONSENT_ACCEPTED,
        null,
        sessionId
      )
    );
  };
}

function mapScopes(scopes: string[]) {
  const returnScopes: string[] = [];
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
