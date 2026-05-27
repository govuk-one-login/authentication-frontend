import type { Request, Response } from "express";
import type { StartSignInWithPasskeyInterface } from "./types.js";
import { startSignInWithPasskeyService } from "./sign-in-with-passkey-service.js";
import type { ExpressRouteFunc } from "../../types.js";

export function signInWithPasskeyGet(
  service: StartSignInWithPasskeyInterface = startSignInWithPasskeyService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const startPasskeyAssertionResult = await service.startSignInWithPasskey(
      res.locals.sessionId,
      res.locals.clientSessionId,
      res.locals.persistentSessionId,
      req
    );

    if (!startPasskeyAssertionResult.success) {
      throw new Error(
        `StartPasskeyAssertionError: ${startPasskeyAssertionResult.data.message}`
      );
    }

    const authenticationOptions = startPasskeyAssertionResult.data;

    res.render("sign-in-with-passkey/index.njk", {
      authenticationOptions: JSON.stringify(authenticationOptions),
    });
  };
}
