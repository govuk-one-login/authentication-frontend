import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { BadRequestError } from "../../utils/error";
import { proveIdentityService } from "./prove-identity-service";
import { ProveIdentityServiceInterface } from "./types";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function proveIdentityGet(
  service: ProveIdentityServiceInterface = proveIdentityService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const result = await service.ipvAuthorize(
      sessionId,
      clientSessionId,
      email,
      req.ip,
      persistentSessionId
    );
    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.PROVE_IDENTITY_INIT,
      null,
      sessionId
    );

    return res.redirect(result.data.redirectUri);
  };
}
