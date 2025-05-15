import type { Request, Response } from "express";
import { MFA_METHOD_TYPE, PATH_NAMES } from "../../app.constants.js";
import type { MfaMethod } from "../../types.js";
import { getNextPathAndUpdateJourney } from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { BadRequestError } from "../../utils/error.js";

export function sortMfaMethodsBackupFirst(
  mfaMethods: MfaMethod[]
): MfaMethod[] {
  return mfaMethods
    .slice()
    .sort((a, b) => a.priority.localeCompare(b.priority, "en"));
}

export function howDoYouWantSecurityCodesGet(
  req: Request,
  res: Response
): void {
  const { isPasswordResetJourney } = req.session.user;
  const supportMfaReset = !isPasswordResetJourney;

  res.render("how-do-you-want-security-codes/index.njk", {
    mfaResetLink: PATH_NAMES.MFA_RESET_WITH_IPV,
    mfaMethods: sortMfaMethodsBackupFirst(req.session.user.mfaMethods || []),
    supportMfaReset,
  });
}

export async function howDoYouWantSecurityCodesPost(
  req: Request,
  res: Response
): Promise<void> {
  const mfaMethodId = req.body["mfa-method-id"];
  const selectedMethod = req.session.user.mfaMethods.find(
    (method: MfaMethod) => method.id === mfaMethodId
  );

  if (selectedMethod === undefined) {
    throw new BadRequestError("No MFA methods found", 500);
  }

  if (selectedMethod.type === MFA_METHOD_TYPE.SMS) {
    req.session.user.activeMfaMethodId = mfaMethodId;
    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.SELECT_SMS_MFA_METHOD,
        null,
        res.locals.sessionId
      )
    );
  }

  if (selectedMethod.type === MFA_METHOD_TYPE.AUTH_APP) {
    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.SELECT_AUTH_APP_MFA_METHOD,
        null,
        res.locals.sessionId
      )
    );
  }

  throw new BadRequestError("MFA method type does not exist", 500);
}
