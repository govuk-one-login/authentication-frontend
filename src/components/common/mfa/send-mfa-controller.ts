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
import { PATH_NAMES } from "../../../app.constants.js";
import { sanitize } from "../../../utils/strings.js";
import xss from "xss";
import { getJourneyTypeFromUserSession } from "../journey/journey.js";
import { isReauth } from "../../../utils/request.js";
function addGA(req: Request, redirectPath: string) {
  if (req.query._ga) {
    const queryParams = new URLSearchParams({
      _ga: sanitize(req.query._ga as string),
    }).toString();

    redirectPath = redirectPath + "?" + queryParams;
  }
  return redirectPath;
}

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

  if (pathWithQueryParams && isResendCodeRequest) {
    return pathWithQueryParams.includes("?")
      ? res.redirect(pathWithQueryParams + "&isResendCodeRequest=true")
      : res.redirect(pathWithQueryParams + "?isResendCodeRequest=true");
  }

  if (isReauth(req)) {
    if (
      mfaFailResponse.data.code ===
        ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED ||
      mfaFailResponse.data.code === ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES
    ) {
      return res.redirect(
        req.session.client.redirectUri.concat("?error=login_required")
      );
    }
    if (mfaFailResponse.data.code === ERROR_CODES.MFA_SMS_MAX_CODES_SENT) {
      return res.redirect(
        getErrorPathByCode(ERROR_CODES.MFA_SMS_MAX_CODES_SENT)
      );
    }
  }

  if (pathWithQueryParams && !isResendCodeRequest) {
    res.redirect(pathWithQueryParams);
  }

  throw new BadRequestError(
    mfaFailResponse.data.message,
    mfaFailResponse.data.code
  );
}

export function sendMfaGeneric(
  mfaCodeService: MfaServiceInterface
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email, activeMfaMethodId } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const isResendCodeRequest: boolean = req.body.isResendCodeRequest;

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

    let redirectPath;

    if (!isResendCodeRequest) {
      redirectPath = await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.VERIFY_MFA
      );
    }

    if (isResendCodeRequest) {
      redirectPath = PATH_NAMES.CHECK_YOUR_PHONE;
    }

    redirectPath = addGA(req, redirectPath);

    return res.redirect(redirectPath);
  };
}
