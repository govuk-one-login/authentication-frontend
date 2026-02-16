import type { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.js";
import { amcResultService } from "./amc-result-service.js";
import type { AMCResultInterface } from "./types.js";
import type { ExpressRouteFunc } from "../../types.js";

export function amcCallbackGet(
  service: AMCResultInterface = amcResultService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<void> {
    const { code, state } = req.query;

    if (code === undefined) {
      throw new BadRequestError("Request query missing auth code param", 400);
    } else if (typeof code !== "string") {
      throw new BadRequestError("Invalid auth code param type", 400);
    }

    if (state === undefined) {
      throw new BadRequestError("Request query missing state param", 400);
    } else if (typeof state !== "string") {
      throw new BadRequestError("Invalid state param type", 400);
    }

    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.getAMCResult(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      code,
      state
    );

    if (!result.success) {
      throw new BadRequestError(`AMC callback failed: ${result.data}`, 400);
    }

    res.status(200).json({ message: result.data });
  };
}
