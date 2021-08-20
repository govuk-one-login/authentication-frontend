import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { SignInOrCreateServiceInterface } from "./types";
import { signInOrCreateService } from "./sign-in-or-create-service";
import { SERVICE_TYPE } from "../../app.constants";

export function signInOrCreateGet(
  service: SignInOrCreateServiceInterface = signInOrCreateService(),
): ExpressRouteFunc {
  return async function(req: Request, res: Response) {
    const sessionId = res.locals.sessionId;
    const clientSessionId = res.locals.clientSessionId;
    const clientInfo = await service.clientInfo(sessionId, clientSessionId);
    if (clientInfo.service_type) {
      req.session.serviceType = clientInfo.service_type;
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
  res.redirect("/enter-email");
}
