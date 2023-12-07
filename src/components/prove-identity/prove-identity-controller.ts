import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { BadRequestError } from "../../utils/error";
import { proveIdentityService } from "./prove-identity-service";
import { ProveIdentityServiceInterface } from "./types";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { supportAuthOrchSplit } from "../../config";
import { authCodeGet } from "../auth-code/auth-code-controller";
import { AuthCodeServiceInterface } from "../auth-code/types";
import { authCodeService } from "../auth-code/auth-code-service";

export function proveIdentityGet(
  service: ProveIdentityServiceInterface = proveIdentityService(),
  authCode: AuthCodeServiceInterface = authCodeService()
): ExpressRouteFunc {
  const returnToOrchestration = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { sessionId } = res.locals;
    getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.PROVE_IDENTITY_INIT,
      null,
      sessionId
    );

    return authCodeGet(authCode)(req, res);
  };

  return async function (req: Request, res: Response) {
    if (supportAuthOrchSplit()) {
      return returnToOrchestration(req, res);
    }

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
