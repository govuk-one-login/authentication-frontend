import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { PATH_NAMES, SERVICE_TYPE } from "../../app.constants";
import { clientInfoService } from "../common/client-info/client-info-service";
import { ClientInfoServiceInterface } from "../common/client-info/types";
import { BadRequestError } from "../../utils/error";

export function signInOrCreateGet(
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
  req.session.user.createAccount = req.body.createAccount === "true";
  res.redirect(PATH_NAMES.ENTER_EMAIL);
}
