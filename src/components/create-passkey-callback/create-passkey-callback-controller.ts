import type { Request, Response } from "express";
import { amcResultService } from "../amc-service/amc-result-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import { BadRequestError } from "../../utils/error.js";
import xss from "xss";
import {
  AMC_ERROR_DESCRIPTION,
  AMC_SCOPE,
  type CreatePasskeyResultSuccessResponse,
  type ErrorConfiguration,
} from "./types.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { saveSessionState } from "../common/constants.js";
import type { AMCResultInterface } from "../amc-service/types.js";

const ERROR_CONFIG_MAP = new Map<string, ErrorConfiguration>([
  [
    AMC_ERROR_DESCRIPTION.USER_BACKED_OUT_OF_JOURNEY,
    {
      errorEvent: USER_JOURNEY_EVENTS.CREATE_PASSKEY_BACK,
      updateSession: async () => {
        return;
      },
    },
  ],
  [
    AMC_ERROR_DESCRIPTION.USER_ABORTED_JOURNEY,
    {
      errorEvent: USER_JOURNEY_EVENTS.CREATE_PASSKEY_SKIPPED,
      updateSession: async (req: Request) => {
        req.session.user.hasSkippedPasskeyRegistration = true;
        await saveSessionState(req);
      },
    },
  ],
]);

function getErrorDescription(result: CreatePasskeyResultSuccessResponse) {
  const createPasskeyJourney = result.journeys.find(
    (journey) => journey.journey === AMC_SCOPE.PASSKEY_CREATE
  );

  return (
    createPasskeyJourney.details.error.description ||
    AMC_ERROR_DESCRIPTION.USER_BACKED_OUT_OF_JOURNEY
  );
}

export function createPasskeyCallbackGet(
  service: AMCResultInterface<CreatePasskeyResultSuccessResponse> = amcResultService()
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
      "not-the-correct-state",
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

      const errorConfig = ERROR_CONFIG_MAP.get(errorDescription);
      if (!errorConfig) {
        throw new BadRequestError(
          `Unexpected error description: ${errorDescription}`,
          500
        );
      }

      await errorConfig.updateSession(req);

      res.redirect(
        await getNextPathAndUpdateJourney(req, res, errorConfig.errorEvent)
      );
    }
  };
}
