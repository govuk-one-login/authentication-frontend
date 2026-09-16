import type { Request, Response } from "express";
import type {
  ApiResponseResult,
  DefaultApiResponse,
  ExpressRouteFunc,
} from "../../../types.js";
import type { MfaServiceInterface } from "./types.js";
import { ERROR_CODES, getErrorPathByCode } from "../constants.js";
import { getNextPathAndUpdateJourney } from "../state-machine/state-machine-executor.js";
import { BadRequestError } from "../../../utils/error.js";
import { USER_JOURNEY_EVENTS } from "../state-machine/state-machine.js";
import xss from "xss";
import { getJourneyTypeFromUserSession } from "../journey/journey.js";
import { isReauth } from "../../../utils/request.js";

async function handleErrors(
  mfaFailResponse: ApiResponseResult<DefaultApiResponse>,
  isResendCodeRequest: boolean,
  res: Response<any, Record<string, any>>,
  req: Request
) {
  if (
    mfaFailResponse.data.code ===
    ERROR_CODES.INDEFINITELY_BLOCKED_INTERNATIONAL_SMS
  ) {
    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.MFA_INDEFINITELY_BLOCKED
      )
    );
  }

  const pathWithQueryParams = getErrorPathByCode(mfaFailResponse.data.code);

  // NOTE: the resend and non-resend branches below deliberately sit on either
  // side of the isReauth() check. A resend request redirects to the error page
  // directly, whereas a non-resend reauth request is instead logged out
  // (login_required).
  if (pathWithQueryParams && isResendCodeRequest) {
    return res.redirect(pathWithQueryParams);
  }

  if (isReauth(req)) {
    if (
      mfaFailResponse.data.code ===
        ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED ||
      mfaFailResponse.data.code === ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES ||
      mfaFailResponse.data.code === ERROR_CODES.MFA_SMS_MAX_CODES_SENT
    ) {
      return res.redirect(
        req.session.client.redirectUri.concat("?error=login_required")
      );
    }
  }

  if (pathWithQueryParams && !isResendCodeRequest) {
    return res.redirect(pathWithQueryParams);
  }

  throw new BadRequestError(
    mfaFailResponse.data.message,
    mfaFailResponse.data.code
  );
}

export function sendMfaGeneric(
  mfaCodeService: MfaServiceInterface,
  isResendCodeRequest: boolean
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email, activeMfaMethodId } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await mfaCodeService.sendMfaCode(
      sessionId,
      clientSessionId,
      email,
      persistentSessionId,
      isResendCodeRequest,
      xss(req.cookies.lng as string),
      req,
      activeMfaMethodId,
      getJourneyTypeFromUserSession(req.session.user, {
        includeReauthentication: true,
        includePasswordResetMfa: true,
      })
    );

    if (!result.success) {
      return handleErrors(result, isResendCodeRequest, res, req);
    }

    return res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.VERIFY_MFA
      )
    );
  };
}
