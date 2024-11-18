import { MfaResetAuthorizeInterface } from "./types";
import { mfaResetAuthorizeService } from "./mfa-reset-authorize-service";
import { ExpressRouteFunc } from "../../types";
import { Request, Response } from "express";
import { BadRequestError } from "../../utils/error";

export function mfaResetWithIpvGet(
  service: MfaResetAuthorizeInterface = mfaResetAuthorizeService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.ipvRedirectUrl(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      email
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    const ipvCoreURL = result.data.authorize_url;

    res.redirect(ipvCoreURL);
  };
}
