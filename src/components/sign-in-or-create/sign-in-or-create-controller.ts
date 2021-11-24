import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { PATH_NAMES, SERVICE_TYPE } from "../../app.constants";
import { clientInfoService } from "../common/client-info/client-info-service";
import { ClientInfoServiceInterface } from "../common/client-info/types";
import { BadRequestError } from "../../utils/error";
import { JOURNEY_TYPE } from "../common/constants";

export function signInOrCreateGet(
  service: ClientInfoServiceInterface = clientInfoService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const clientInfoResponse = await service.clientInfo(
      sessionId,
      clientSessionId,
      req.ip,
      persistentSessionId
    );

    if (!clientInfoResponse.success) {
      throw new BadRequestError(
        clientInfoResponse.message,
        clientInfoResponse.code
      );
    }

    if (
      clientInfoResponse.data.serviceType &&
      clientInfoResponse.data.clientName
    ) {
      req.session.serviceType = clientInfoResponse.data.serviceType;
      req.session.clientName = clientInfoResponse.data.clientName;
    } else {
      req.session.serviceType = SERVICE_TYPE.MANDATORY;
    }

    res.render("sign-in-or-create/index.njk", {
      serviceType: req.session.serviceType,
    });
  };
}

export function signInOrCreatePost(req: Request, res: Response): void {
  const type =
    req.body.createAccount === "true"
      ? JOURNEY_TYPE.CREATE_ACCOUNT
      : JOURNEY_TYPE.SIGN_IN;
  res.redirect(PATH_NAMES.ENTER_EMAIL + "?type=" + type);
}
