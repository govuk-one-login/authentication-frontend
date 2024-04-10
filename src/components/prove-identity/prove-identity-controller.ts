import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { authCodeGet } from "../auth-code/auth-code-controller";
import { AuthCodeServiceInterface } from "../auth-code/types";
import { authCodeService } from "../auth-code/auth-code-service";

export function proveIdentityGet(
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
    return returnToOrchestration(req, res);
  };
}
