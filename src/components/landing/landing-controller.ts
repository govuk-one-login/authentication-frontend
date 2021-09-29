import { Request, Response } from "express";
import { PATH_NAMES } from "../../app.constants";
import { getNextPathByState } from "../common/constants";

export function landingGet(req: Request, res: Response): void {
  if (!req.query.interrupt) {
    return res.redirect(PATH_NAMES.SIGN_IN_OR_CREATE);
  }
  //TODO add values for consent and t&cs
  res.redirect(getNextPathByState(req.query.interrupt as string));
}
