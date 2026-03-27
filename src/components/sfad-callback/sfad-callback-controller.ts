import type { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.js";
import { amcResultService } from "../amc-service/amc-result-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import xss from "xss";
import type { AMCResultInterface } from "../amc-service/types.js";

export function sfadCallbackGet(
  service: AMCResultInterface<boolean> = amcResultService()
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

    const { sessionId, clientSessionId, persistentSessionId, currentUrl } =
      res.locals;

    const redirectUrlWithoutQueryParams =
      currentUrl.origin + currentUrl.pathname;

    const result = await service.getAMCResult(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      code,
      state,
      redirectUrlWithoutQueryParams,
      xss(req.cookies.lng as string)
    );

    if (!result.success) {
      throw new BadRequestError(`AMC callback failed: ${result.data}`, 400);
    }

    res.status(200).json({ message: result.data });
  };
}
