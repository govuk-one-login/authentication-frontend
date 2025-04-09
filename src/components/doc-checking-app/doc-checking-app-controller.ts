import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types.js";
import { BadRequestError } from "../../utils/error.js";
import { DocCheckingAppInterface } from "./types.js";
import { getNextPathAndUpdateJourney } from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { docCheckingAppService } from "./doc-checking-app-service.js";
export function docCheckingAppGet(
  service: DocCheckingAppInterface = docCheckingAppService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const result = await service.docCheckingAppAuthorize(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req
    );
    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    getNextPathAndUpdateJourney(
      req,
      req.path,
      USER_JOURNEY_EVENTS.DOC_CHECKING_AUTH_REDIRECT,
      null,
      sessionId
    );

    return res.redirect(result.data.redirectUri);
  };
}
