import type { SfadAuthorizeInterface } from "./types.js";
import { sfadAuthorizeService } from "./sfad-authorize-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import type { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.js";
import { setAmcCookie } from "../../utils/amc-cookie.js";

export function sfadAuthorizeGet(
  service: SfadAuthorizeInterface = sfadAuthorizeService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<void> {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.getRedirectUrl(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    const redirectUrl = result.data.redirectUrl;

    setAmcCookie(redirectUrl, res);

    res.redirect(redirectUrl);
  };
}
