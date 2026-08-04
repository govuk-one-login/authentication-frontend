import type { Request, Response } from "express";
import { amcResultService } from "../amc-service/amc-result-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import { BadRequestError } from "../../utils/error.js";
import xss from "xss";
import {
  AMC_ERROR_DESCRIPTION,
  AMC_SCOPE,
  type CreatePasskeyResultSuccessResponse,
} from "./types.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { saveSessionState } from "../common/constants.js";
import type { AMCResultInterface } from "../amc-service/types.js";
import {
  type UpdateProfileServiceInterface,
  UpdateType,
} from "../common/update-profile/types.js";
import { updateProfileService } from "../common/update-profile/update-profile-service.js";

function getErrorDescription(result: CreatePasskeyResultSuccessResponse) {
  const createPasskeyJourney = result.actions.find(
    (journey) => journey.action === AMC_SCOPE.PASSKEY_CREATE
  );

  return (
    createPasskeyJourney.details.error.description ||
    AMC_ERROR_DESCRIPTION.USER_BACKED_OUT_OF_JOURNEY
  );
}

export function createPasskeyCallbackGet(
  service: AMCResultInterface<CreatePasskeyResultSuccessResponse> = amcResultService(),
  updateUserProfileService: UpdateProfileServiceInterface = updateProfileService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<void> {
    const { sessionId, clientSessionId, persistentSessionId, currentUrl } =
      res.locals;
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

    if (result.success === false) {
      throw new BadRequestError(
        `AMC callback failed: ${JSON.stringify(result.data)}`,
        400
      );
    }

    if (result.data.scope !== AMC_SCOPE.PASSKEY_CREATE) {
      throw new BadRequestError("Scope should be passkey-create", 502);
    }

    if (result.data.success) {
      req.log.info(`Passkey creation completed for session id ${sessionId}`);
      req.session.user.hasActivePasskey = true;
      await saveSessionState(req);

      res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          res,
          USER_JOURNEY_EVENTS.CREATE_PASSKEY_COMPLETED
        )
      );
    } else {
      const errorDescription = getErrorDescription(result.data);

      req.log.info(
        `Passkey creation failed for session id ${sessionId} with error ${errorDescription}`
      );

      await performActionsForAmcError(
        errorDescription,
        updateUserProfileService,
        req,
        res
      );

      res.redirect(
        await getNextPathAndUpdateJourney(
          req,
          res,
          getJourneyEventForError(errorDescription)
        )
      );
    }
  };
}

function getJourneyEventForError(amcErrorDescription: AMC_ERROR_DESCRIPTION) {
  switch (amcErrorDescription) {
    case AMC_ERROR_DESCRIPTION.USER_ABORTED_JOURNEY:
      return USER_JOURNEY_EVENTS.AMC_RETURNED_CREATE_PASSKEY_SKIPPED;
    case AMC_ERROR_DESCRIPTION.ACCOUNT_HAS_INTERVENTIONS:
      return USER_JOURNEY_EVENTS.AMC_RETURNED_ACCOUNT_INTERVENTIONS;
    case AMC_ERROR_DESCRIPTION.USER_BACKED_OUT_OF_JOURNEY:
      return USER_JOURNEY_EVENTS.AMC_RETURNED_CREATE_PASSKEY_BACK;
  }
}

async function performActionsForAmcError(
  amcErrorDescription: AMC_ERROR_DESCRIPTION,
  updateUserProfileService: UpdateProfileServiceInterface,
  req: Request,
  res: Response
) {
  switch (amcErrorDescription) {
    case AMC_ERROR_DESCRIPTION.USER_ABORTED_JOURNEY: {
      const updateResult = await updateUserProfileWithSkip(
        res,
        req,
        updateUserProfileService
      );
      if (!updateResult.success) {
        req.log.warn(
          "Did not successfully manage to update profile with skip event, passkey registration prompt may not be suppressed"
        );
      }
      req.session.user.hasSkippedPasskeyRegistration = true;
      return await saveSessionState(req);
    }
    case AMC_ERROR_DESCRIPTION.ACCOUNT_HAS_INTERVENTIONS:
      req.session.user.accountInterventionAppliedDuringPasskeyRegistration = true;
      return await saveSessionState(req);
    case AMC_ERROR_DESCRIPTION.USER_BACKED_OUT_OF_JOURNEY:
      return;
    default:
      throw new BadRequestError(
        `Unexpected error description: ${amcErrorDescription}`,
        500
      );
  }
}

async function updateUserProfileWithSkip(
  res: Response,
  req: Request,
  updateUserProfileService: UpdateProfileServiceInterface
) {
  return await updateUserProfileService.updateProfile(
    res.locals.sessionId,
    res.locals.clientSessionId,
    req.session.user.email,
    UpdateType.SKIP_ADDING_PASSKEY,
    res.locals.persistentSessionId,
    req
  );
}
