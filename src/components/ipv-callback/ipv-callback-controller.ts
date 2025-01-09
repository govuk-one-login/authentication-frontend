import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import {
  isReverificationResultFailedResponse,
  REVERIFICATION_ERROR_CODE,
  ReverificationResultInterface,
} from "./types";
import { logger } from "../../utils/logger";
import { reverificationResultService } from "./reverification-result-service";
import { BadRequestError } from "../../utils/error";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import {
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../app.constants";

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
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const code = req.query.code;

    if (code === undefined) {
      throw new BadRequestError("Request query missing auth code param", 400);
    } else if (typeof code !== "string") {
      throw new BadRequestError("Invalid auth code param type", 400);
    }

    const result = await service.getReverificationResult(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      email,
      code
    );

    logger.info(
      `Reverification result for session id ${res.locals.sessionId} is success: ${result.success}`
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    if (isReverificationResultFailedResponse(result.data)) {
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
  if (
    cannotChangeHowGetSecurityCodeAction ===
    CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE
  ) {
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
  } else {
    res.send("In development");
  }
}
