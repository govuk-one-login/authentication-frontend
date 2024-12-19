import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import {
  isReverificationResultFailedResponse,
  REVERIFICATION_ERROR_CODE,
  ReverificationResultInterface,
} from "./types";
import { logger } from "../../utils/logger";
import { reverificationResultService } from "./reverification-result-service";
import { BadRequestError } from "../../utils/error";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";

export function ipvCallbackGet(
  service: ReverificationResultInterface = reverificationResultService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const code = req.query.code;

    if (code === undefined) {
      throw new BadRequestError("Request query missing auth code param", 400);
    } else if (typeof code !== "string") {
      throw new BadRequestError("Invalid auth code param type", 400);
    }

    const result = await service.getReverificationResult(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      email,
      code
    );

    logger.info(
      `Reverification result for session id ${res.locals.sessionId} is success: ${result.success}`
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    if (isReverificationResultFailedResponse(result.data)) {
      if (
        [
          REVERIFICATION_ERROR_CODE.NO_IDENTITY_AVAILABLE,
          REVERIFICATION_ERROR_CODE.IDENTITY_CHECK_INCOMPLETE,
        ].includes(result.data.failure_code)
      ) {
        return res.redirect(
          await getNextPathAndUpdateJourney(
            req,
            req.path,
            USER_JOURNEY_EVENTS.IPV_REVERIFICATION_INCOMPLETE_OR_UNAVAILABLE,
            {},
            sessionId
          )
        );
      }
      throw new Error(result.data.failure_code);
    }

    res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.IPV_REVERIFICATION_COMPLETED,
        {},
        sessionId
      )
    );
  };
}

export function cannotChangeSecurityCodesGet(
  req: Request,
  res: Response
): void {
  res.render("ipv-callback/index-cannot-change-how-get-security-codes.njk");
}

export function cannotChangeSecurityCodesPost(
  req: Request,
  res: Response
): void {
  res.send("In development");
}
