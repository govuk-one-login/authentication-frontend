import { Request, Response } from "express";
import {
  ApiResponseResult,
  DefaultApiResponse,
  ExpressRouteFunc,
} from "../../../types";
import { MfaServiceInterface } from "./types";
import {
  ERROR_CODES,
  getErrorPathByCode,
  getNextPathAndUpdateJourney,
} from "../constants";
import { BadRequestError } from "../../../utils/error";
import { USER_JOURNEY_EVENTS } from "../state-machine/state-machine";
import { PATH_NAMES } from "../../../app.constants";
import { sanitize } from "../../../utils/strings";
import xss from "xss";
import { getJourneyTypeFromUserSession } from "../journey/journey";
import { isReauth } from "../../../utils/request";

function addGA(req: Request, redirectPath: string) {
  if (req.query._ga) {
    const queryParams = new URLSearchParams({
      _ga: sanitize(req.query._ga as string),
    }).toString();

    redirectPath = redirectPath + "?" + queryParams;
  }
  return redirectPath;
}

function handleErrors(
  mfaFailResponse: ApiResponseResult<DefaultApiResponse>,
  isResendCodeRequest: boolean,
  res: Response<any, Record<string, any>>,
  req: Request
) {
  const path = getErrorPathByCode(mfaFailResponse.data.code);

  if (path && isResendCodeRequest) {
    return path.includes("?")
      ? res.redirect(path + "&isResendCodeRequest=true")
      : res.redirect(path + "?isResendCodeRequest=true");
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

  if (path && !isResendCodeRequest) {
    res.redirect(path);
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
    const { email } = req.session.user;
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
      getJourneyTypeFromUserSession(req.session.user, {
        includeReauthentication: true,
      })
    );

    if (!result.success) {
      return handleErrors(result, isResendCodeRequest, res, req);
    }

    let redirectPath;

    if (!isResendCodeRequest) {
      redirectPath = await getNextPathAndUpdateJourney(
        req,
        PATH_NAMES.ENTER_MFA,
        USER_JOURNEY_EVENTS.VERIFY_MFA,
        {
          isLatestTermsAndConditionsAccepted:
            req.session.user.isLatestTermsAndConditionsAccepted,
          isIdentityRequired: req.session.user.isIdentityRequired,
        },
        sessionId
      );
    }

    if (isResendCodeRequest) {
      redirectPath = PATH_NAMES.CHECK_YOUR_PHONE;
    }

    redirectPath = addGA(req, redirectPath);

    return res.redirect(redirectPath);
  };
}
