import { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { ExpressRouteFunc } from "../../types";
import {
  IdentityProcessingStatus,
  ProveIdentityCallbackServiceInterface,
} from "./types";
import { proveIdentityCallbackService } from "./prove-identity-callback-service";
import { IPV_ERROR_CODES, OIDC_ERRORS } from "../../app.constants";
import { createServiceRedirectErrorUrl } from "../../utils/error";
import { supportNewIpvSpinner } from "../../config";

export function proveIdentityCallbackGetOrPost(
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
      if (supportNewIpvSpinner()) {
        return res.render("prove-identity-callback/index-new-spinner.njk");
      }

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

export function proveIdentityCallbackGetAsync(
  service: ProveIdentityCallbackServiceInterface = proveIdentityCallbackService()
): (req: Request, res: Response) => Promise<void> {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const email = req.session.user.email;

    const response = await service.processIdentity(
      email,
      sessionId,
      clientSessionId,
      persistentSessionId,
      req
    );

    if (response.data.status) {
      if (response.data.status === IdentityProcessingStatus.INTERVENTION) {
        res.json({
          status: IdentityProcessingStatus.INTERVENTION,
        });
      } else if (response.data.status === IdentityProcessingStatus.PROCESSING) {
        res.json({
          status: IdentityProcessingStatus.PROCESSING,
        });
      } else if (response.data.status === IdentityProcessingStatus.COMPLETED) {
        req.session.user.authCodeReturnToRP = true;
        res.json({
          status: IdentityProcessingStatus.COMPLETED,
        });
      } else {
        res.json({
          status: IdentityProcessingStatus.ERROR,
        });
      }
    } else {
      res.json({
        status: IdentityProcessingStatus.ERROR,
      });
    }
  };
}

export function proveIdentityCallbackSessionExpiryError(
  req: Request,
  res: Response
): void {
  res.render("prove-identity-callback/session-expiry-error.njk");
}
