import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { BadRequestError } from "../../utils/error";
import { proveIdentityService } from "./prove-identity-service";
import { ProveIdentityServiceInterface } from "./types";

export function proveIdentityGet(
  service: ProveIdentityServiceInterface = proveIdentityService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const result = await service.ipvAuthorize(
      sessionId,
      clientSessionId,
      email,
      req.ip,
      persistentSessionId
    );
    if (!result.success) {
      throw new BadRequestError(result.message, result.code);
    }
    return res.redirect(result.redirectUri);
  };
}