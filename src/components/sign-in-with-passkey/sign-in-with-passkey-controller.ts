import type { Request, Response } from "express";
import type { PasskeyServiceInterface } from "../common/passkey/types.js";
import { passkeyService } from "../common/passkey/passkey-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";

export function signInWithPasskeyGet(
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

    res.render("sign-in-with-passkey/index.njk", {
      authenticationOptions: JSON.stringify(authenticationOptions.publicKey),
    });
  };
}

export function signInWithPasskeyPost(
  service: PasskeyServiceInterface = passkeyService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const authenticationError = req.body.authenticationError;
    if (!!authenticationError) {
      req.log.warn("Passkey usage failed with error: %s", authenticationError);
      return res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          res,
          USER_JOURNEY_EVENTS.PASSKEY_AUTHENTICATION_FAILED
        )
      );
    }

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
      return res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          res,
          USER_JOURNEY_EVENTS.PASSKEY_VERIFICATION_FAILED
        )
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
