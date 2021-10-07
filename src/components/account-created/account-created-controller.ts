import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { getNextPathByState } from "../common/constants";

export function accountCreatedGet(req: Request, res: Response): void {
  const serviceType = req.session.serviceType;
  const clientName = req.session.clientName;

  res.render("account-created/index.njk", {
    linkUrl: req.session.nextState
      ? getNextPathByState(req.session.nextState)
      : PATH_NAMES.AUTH_CODE,
    serviceType,
    clientName,
  });
}
