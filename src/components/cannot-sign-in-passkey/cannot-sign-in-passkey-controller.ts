import type { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types.js";
import { PasskeyServiceInterface } from "../common/passkey/types.js";
import { passkeyService } from "../common/passkey/passkey-service.js";

export function cannotSignInPasskeyGet(
  service: PasskeyServiceInterface = passkeyService(),
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const startPasskeyAssertionResult = await service.startPasskeyAssertion(
      res.locals.sessionId,
      res.locals.clientSessionId,
      res.locals.persistentSessionId,
      req
    )

    if (!startPasskeyAssertionResult.success) {
      throw new Error(
        `StartPasskeyAssertionError: ${startPasskeyAssertionResult.data.message}`
      )
    }

    const authenticationOptions = startPasskeyAssertionResult.data;

    res.render("cannot-sign-in-passkey/index.njk", {
      authenticationOptions: JSON.stringify(authenticationOptions.publicKey),
    });
  }
}
