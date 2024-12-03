import { NextFunction, Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { ExpressRouteFunc } from "../../types";
import {
  IdentityProcessingStatus,
  ProveIdentityCallbackServiceInterface,
} from "./types";
import { proveIdentityCallbackService } from "./prove-identity-callback-service";
import {
  HTTP_STATUS_CODES,
  IPV_ERROR_CODES,
  OIDC_ERRORS,
} from "../../app.constants";
import { createServiceRedirectErrorUrl } from "../../utils/error";

export function proveIdentityCallbackGet(
  service: ProveIdentityCallbackServiceInterface = proveIdentityCallbackService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const clientName = req.session.client.name;
    const email = req.session.user.email;

    const response = await service.processIdentity(
      email,
      sessionId,
      clientSessionId,
      persistentSessionId,
      req
    );

    if (response.data.status === IdentityProcessingStatus.INTERVENTION) {
      return res.redirect(response.data.redirectUrl);
    }

    if (response.data.status === IdentityProcessingStatus.PROCESSING) {
      return res.render("prove-identity-callback/index.njk", {
        serviceName: clientName,
      });
    }

    let redirectPath;

    if (response.data.status === IdentityProcessingStatus.COMPLETED) {
      req.session.user.authCodeReturnToRP = true;

      redirectPath = await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.PROVE_IDENTITY_CALLBACK,
        null,
        sessionId
      );
    } else {
      redirectPath = createServiceRedirectErrorUrl(
        req.session.client.rpRedirectUri,
        OIDC_ERRORS.ACCESS_DENIED,
        IPV_ERROR_CODES.IDENTITY_PROCESSING_TIMEOUT,
        req.session.client.rpState
      );
    }

    return res.redirect(redirectPath);
  };
}

export function proveIdentityStatusCallbackGet(
  service: ProveIdentityCallbackServiceInterface = proveIdentityCallbackService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const email = req.session.user.email;

    try {
      const response = await service.processIdentity(
        email,
        sessionId,
        clientSessionId,
        persistentSessionId,
        req
      );

      if (response.data.status === IdentityProcessingStatus.PROCESSING) {
        res.status(HTTP_STATUS_CODES.OK).json({
          status: IdentityProcessingStatus.PROCESSING,
        });
      }

      if (response.data.status === IdentityProcessingStatus.COMPLETED) {
        res.status(HTTP_STATUS_CODES.OK).json({
          status: IdentityProcessingStatus.COMPLETED,
        });
      }

      if (response.data.status === IdentityProcessingStatus.INTERVENTION) {
        res.status(HTTP_STATUS_CODES.OK).json({
          status: IdentityProcessingStatus.INTERVENTION,
        });
      }

      if (response.data.status === IdentityProcessingStatus.ERROR) {
        res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
          status: IdentityProcessingStatus.ERROR,
        });
      }
    } catch {
      res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
        status: IdentityProcessingStatus.ERROR,
      });
    }
    return next();
  };
}

export function proveIdentityCallbackSessionExpiryError(
  req: Request,
  res: Response
): void {
  res.render("prove-identity-callback/session-expiry-error.njk");
}
