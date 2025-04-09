import { NextFunction, Request, Response } from "express";
import { upsertDefaultSmsMfaMethod } from "../utils/mfa.js";
import { UserSession } from "../types.js";

export function migrateMfaSessionStorageMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userSession: UserSession & {
    redactedPhoneNumber?: string;
    phoneNumber?: string;
  } = req.session?.user;
  const redactedPhoneNumber = userSession?.redactedPhoneNumber;
  const phoneNumber = userSession?.phoneNumber;
  if (
    userSession &&
    !userSession.mfaMethods &&
    (redactedPhoneNumber || phoneNumber)
  ) {
    req.session.user = {
      ...userSession,
      mfaMethods: upsertDefaultSmsMfaMethod(req.session.user.mfaMethods, {
        redactedPhoneNumber,
        phoneNumber,
      }),
    };
  }

  next();
}
