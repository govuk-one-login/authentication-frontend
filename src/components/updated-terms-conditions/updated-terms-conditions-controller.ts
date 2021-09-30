import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { getNextPathByState } from "../common/constants";
import { BadRequestError } from "../../utils/error";
import { SERVICE_TYPE } from "../../app.constants";
import { ClientInfoServiceInterface } from "../common/client-info/types";
import { UpdateProfileServiceInterface } from "../common/update-profile/types";
import { updateProfileService } from "../common/update-profile/update-profile-service";
import { clientInfoService } from "../common/client-info/client-info-service";

export function updatedTermsConditionsGet(
  service: ClientInfoServiceInterface = clientInfoService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const sessionId = res.locals.sessionId;
    const clientSessionId = res.locals.clientSessionId;

    const clientInfoResponse = await service.clientInfo(
      sessionId,
      clientSessionId,
      req.ip
    );

    req.session.redirectUri = clientInfoResponse.data.redirectUri;
    req.session.state = clientInfoResponse.data.state;
    req.session.serviceType = clientInfoResponse.data.serviceType;
    req.session.clientName = clientInfoResponse.data.clientName;

    res.render("updated-terms-conditions/index.njk");
  };
}

export function updatedTermsRejectedGet(): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const view =
      req.session.serviceType === SERVICE_TYPE.OPTIONAL
        ? "index-optional.njk"
        : "index-mandatory.njk";

    return res.render("updated-terms-conditions/" + view, {
      clientName: req.session.clientName,
    });
  };
}

export function updatedTermsConditionsPost(
  service: UpdateProfileServiceInterface = updateProfileService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId } = res.locals;
    const { redirectUri, state } = req.session;
    const acceptOrReject = req.body.acceptOrReject;

    if (acceptOrReject === "reject") {
      return res.redirect(
        redirectUri + `?error_code=rejectedTermsAndConditions&state=${state}`
      );
    }

    if (acceptOrReject === "accept") {
      const result = await service.updateProfile(
        sessionId,
        clientSessionId,
        email,
        { updateProfileType: "UPDATE_TERMS_CONDS", profileInformation: true },
        req.ip
      );

      if (!result.success) {
        throw new BadRequestError(result.message, result.code);
      }

      res.redirect(getNextPathByState(result.sessionState));
    }
  };
}
