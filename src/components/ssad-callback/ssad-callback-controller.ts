import type { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.js";
import { amcResultService } from "../amc-service/amc-result-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import xss from "xss";
import {
  AMC_ERROR_DESCRIPTION,
  AMC_SCOPE,
  type AMCOutcome,
  type AMCResultInterface,
} from "../amc-service/types.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import type { MFA_METHOD_TYPE } from "../../app.constants.js";
import { getMfaEntryEvent } from "../../utils/mfa.js";

export function ssadCallbackGet(
  service: AMCResultInterface<AMCOutcome> = amcResultService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<void> {
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

    const { sessionId, clientSessionId, persistentSessionId, currentUrl } =
      res.locals;

    const redirectUrlWithoutQueryParams =
      currentUrl.origin + currentUrl.pathname;

    const result = await service.getAMCResult(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      code,
      state,
      redirectUrlWithoutQueryParams,
      xss(req.cookies.lng as string)
    );

    if (!result.success) {
      throw new BadRequestError(`AMC callback failed: ${result.data}`, 400);
    }

    if (result.data.scope !== AMC_SCOPE.ACCOUNT_DELETE) {
      throw new BadRequestError("Scope should be account-delete", 502);
    }

    if (result.data.success) {
      req.log.info(`Account deletion completed for session id ${sessionId}`);

      res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          res,
          USER_JOURNEY_EVENTS.SELF_SERVE_ACCOUNT_DELETION_COMPLETED
        )
      );
    } else {
      const errorDescription = getErrorDescription(result.data);

      req.log.info(
        `Account deletion not completed for session id ${sessionId} with error ${errorDescription}`
      );

      res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          res,
          getJourneyEventForError(
            errorDescription,
            req.session.user.mfaMethodType
          )
        )
      );
    }
  };
}

function getErrorDescription(result: AMCOutcome) {
  const accountDeleteAction = result.actions.find(
    (action) => action.action === AMC_SCOPE.ACCOUNT_DELETE
  );

  return accountDeleteAction?.details?.error?.description;
}

function getJourneyEventForError(
  amcErrorDescription: AMC_ERROR_DESCRIPTION,
  mfaMethodType: MFA_METHOD_TYPE
) {
  switch (amcErrorDescription) {
    case AMC_ERROR_DESCRIPTION.USER_BACKED_OUT_OF_JOURNEY:
    case AMC_ERROR_DESCRIPTION.USER_ABORTED_JOURNEY:
      return getMfaEntryEvent(mfaMethodType);
    default:
      throw new BadRequestError(
        `Unexpected error description: ${amcErrorDescription}`,
        500
      );
  }
}
