import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import type { ReverificationResultInterface } from "./types.js";
import {
  isReverificationResultFailedResponse,
  REVERIFICATION_ERROR_CODE,
} from "./types.js";
import { logger } from "../../utils/logger.js";
import { reverificationResultService } from "./reverification-result-service.js";
import { BadRequestError } from "../../utils/error.js";
import { getNextPathAndUpdateJourney } from "../common/constants.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import {
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../app.constants.js";

const ERROR_TO_EVENT_MAP = new Map<string, string>();
ERROR_TO_EVENT_MAP.set(
  REVERIFICATION_ERROR_CODE.NO_IDENTITY_AVAILABLE,
  USER_JOURNEY_EVENTS.IPV_REVERIFICATION_INCOMPLETE_OR_UNAVAILABLE
);
ERROR_TO_EVENT_MAP.set(
  REVERIFICATION_ERROR_CODE.IDENTITY_CHECK_INCOMPLETE,
  USER_JOURNEY_EVENTS.IPV_REVERIFICATION_INCOMPLETE_OR_UNAVAILABLE
);
ERROR_TO_EVENT_MAP.set(
  REVERIFICATION_ERROR_CODE.IDENTITY_CHECK_FAILED,
  USER_JOURNEY_EVENTS.IPV_REVERIFICATION_FAILED_OR_DID_NOT_MATCH
);
ERROR_TO_EVENT_MAP.set(
  REVERIFICATION_ERROR_CODE.IDENTITY_DID_NOT_MATCH,
  USER_JOURNEY_EVENTS.IPV_REVERIFICATION_FAILED_OR_DID_NOT_MATCH
);

export function ipvCallbackGet(
  service: ReverificationResultInterface = reverificationResultService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<void> {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const { code, state } = req.query;

    if (code === undefined) {
      throw new BadRequestError("Request query missing auth code param", 400);
    } else if (typeof code !== "string") {
      throw new BadRequestError("Invalid auth code param type", 400);
    }

    if (state === undefined) {
      throw new BadRequestError("Request query missing state param", 400);
    } else if (typeof state !== "string") {
      throw new BadRequestError("Invalid state param type", 400);
    }

    const result = await service.getReverificationResult(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      email,
      code,
      state
    );

    logger.info(
      `Reverification result for session id ${res.locals.sessionId} is success: ${result.success}`
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    if (isReverificationResultFailedResponse(result.data)) {
      req.session.user.isAccountRecoveryJourney = false;
      const event = ERROR_TO_EVENT_MAP.get(result.data.failure_code);
      if (!event) {
        throw new Error(result.data.failure_code);
      }

      return res.redirect(
        await getNextPathAndUpdateJourney(req, req.path, event, {}, sessionId)
      );
    }

    res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.IPV_REVERIFICATION_COMPLETED,
        {},
        sessionId
      )
    );
  };
}

export function cannotChangeSecurityCodesGet(
  req: Request,
  res: Response
): void {
  res.render("ipv-callback/index-cannot-change-how-get-security-codes.njk", {
    variant:
      req.path === PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL
        ? "identityFailed"
        : "incomplete",
    formPostPath: req.path,
  });
}

export async function cannotChangeSecurityCodesPost(
  req: Request,
  res: Response
): Promise<void> {
  const { sessionId } = res.locals;
  const cannotChangeHowGetSecurityCodeAction =
    req.body.cannotChangeHowGetSecurityCodeAction;

  switch (cannotChangeHowGetSecurityCodeAction) {
    case CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.HELP_DELETE_ACCOUNT:
      return res.redirect(res.locals.contactUsLinkUrl);
    case CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE:
      return res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          req.path,
          req.session.user.mfaMethodType === MFA_METHOD_TYPE.SMS
            ? USER_JOURNEY_EVENTS.VERIFY_MFA
            : USER_JOURNEY_EVENTS.VERIFY_AUTH_APP_CODE,
          {},
          sessionId
        )
      );
  }
}
