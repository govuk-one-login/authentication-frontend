import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import type { PasskeyServiceInterface } from "../common/passkey/types.js";
import { passkeyService } from "../common/passkey/passkey-service.js";
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser";
import { CANNOT_SIGN_IN_PASSKEY_ACTION } from "./types.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { PATH_NAMES } from "../../app.constants.js";

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
    req.session.user.cannotSignInPasskeyAuthOptions = JSON.stringify(
      authenticationOptions.publicKey
    );

    res.render("cannot-sign-in-passkey/index.njk", {
      authenticationOptions: req.session.user.cannotSignInPasskeyAuthOptions,
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
    const cannotSignInPasskeyAction: CANNOT_SIGN_IN_PASSKEY_ACTION =
      req.body["cannot-sign-in-passkey-action"];

    if (
      cannotSignInPasskeyAction ===
      CANNOT_SIGN_IN_PASSKEY_ACTION.SIGN_IN_WITHOUT_PASSKEY
    ) {
      return res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          res,
          USER_JOURNEY_EVENTS.SIGN_IN_WITHOUT_PASSKEY
        )
      );
    }

    const finishPasskeyAssertionResult = await service.finishPasskeyAssertion(
      res.locals.sessionId,
      res.locals.clientSessionId,
      res.locals.persistentSessionId,
      req,
      authenticationResponse
    );

    if (!finishPasskeyAssertionResult.success) {
      req.log.info(
        `Failed to retry sign in with passkey due to FinishPasskeyAssertionError: ${finishPasskeyAssertionResult.data.message}`
      );
      return res.redirect(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY);
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
