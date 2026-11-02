import type { AmcAuthorizeInterface } from "../amc-service/types.js";
import { amcAuthorizeService } from "../amc-service/amc-authorize-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import type { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.js";
import { AMC_JOURNEY_TYPES } from "../../app.constants.js";

export function ssadAuthorizeGet(
  service: AmcAuthorizeInterface = amcAuthorizeService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<void> {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.getRedirectUrl(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      AMC_JOURNEY_TYPES.SELF_SERVE_ACCOUNT_DELETION
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    const redirectUrl = result.data.redirectUrl;

    res.redirect(redirectUrl);
  };
}
