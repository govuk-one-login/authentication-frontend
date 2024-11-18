import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { ReverificationResultInterface } from "./types";
import { logger } from "../../utils/logger";
import { reverificationResultService } from "./reverification-result-service";
import { BadRequestError } from "../../utils/error";

export function ipvCallbackGet(
  service: ReverificationResultInterface = reverificationResultService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.getReverificationResult(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      email
    );

    logger.info(
      `Reverification result for session id ${res.locals.sessionId} is success: ${result.success}`
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    res.status(200).send("Received successful reverification result");
  };
}
