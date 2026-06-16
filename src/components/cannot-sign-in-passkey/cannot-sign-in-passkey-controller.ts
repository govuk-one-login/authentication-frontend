import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import type { PasskeyServiceInterface } from "../common/passkey/types.js";
import { passkeyService } from "../common/passkey/passkey-service.js";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";

export function cannotSignInPasskeyGet(
  service: PasskeyServiceInterface = passkeyService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const startPasskeyAssertionResult = await service.startPasskeyAssertion(
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

    res.render("cannot-sign-in-passkey/index.njk", {
      authenticationOptions: JSON.stringify(authenticationOptions.publicKey),
      is2FAJourney: req.session.user.isMfaRequired,
    });
  };
}

export function cannotSignInPasskeyPost(
  service: PasskeyServiceInterface = passkeyService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const authenticationResponse: AuthenticationResponseJSON =
      req.body.authenticationResponse;

    const finishPasskeyAssertionResult = await service.finishPasskeyAssertion(
      res.locals.sessionId,
      res.locals.clientSessionId,
      res.locals.persistentSessionId,
      req,
      authenticationResponse
    );

    if (!finishPasskeyAssertionResult.success) {
      // TODO - AUT-5000 - Handle error case
      throw new Error(
        `FinishPasskeyAssertionError: ${finishPasskeyAssertionResult.data.message}`
      );
    }

    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.PASSKEY_VERIFICATION_SUCCESSFUL
      )
    );
  };
}
