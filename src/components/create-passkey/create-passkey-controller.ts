import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { saveSessionState } from "../common/constants.js";
import { AMC_JOURNEY_TYPES } from "../../app.constants.js";
import type { AmcAuthorizeInterface } from "../amc-service/types.js";
import { amcAuthorizeService } from "../amc-service/amc-authorize-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import { BadRequestError } from "../../utils/error.js";
import { getAccountDomain } from "../../config.js";
import type { UpdateProfileServiceInterface } from "../common/update-profile/types.js";
import { UpdateType } from "../common/update-profile/types.js";
import { updateProfileService } from "../common/update-profile/update-profile-service.js";

const TEMPLATE_NAME = "create-passkey/index.njk";

export function createPasskeyGet(req: Request, res: Response): void {
  return res.render(TEMPLATE_NAME);
}

export function createPasskeyPost(
  service: AmcAuthorizeInterface = amcAuthorizeService(),
  updateSkipProfileService: UpdateProfileServiceInterface = updateProfileService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<void> {
    if (req.body.createPasskeyOption === "submit") {
      return await handleCreatePasskey(service, req, res);
    } else if (req.body.createPasskeyOption === "skip") {
      return await handleSkipCreatePasskey(req, res, updateSkipProfileService);
    } else {
      throw new Error(
        `Invalid createPasskeyOption: ${req.body.createPasskeyOption}`
      );
    }
  };
}

async function handleSkipCreatePasskey(
  req: Request,
  res: Response,
  updateProfileService: UpdateProfileServiceInterface
) {
  req.log.info("User has skipped passkey registration");
  req.session.user.hasSkippedPasskeyRegistration = true;
  await saveSessionState(req);

  const { email } = req.session.user;
  const { sessionId, clientSessionId, persistentSessionId } = res.locals;
  const updateProfileResult = await updateProfileService.updateProfile(
    sessionId,
    clientSessionId,
    email,
    UpdateType.SKIP_ADDING_PASSKEY,
    persistentSessionId,
    req
  );

  if (!updateProfileResult.success) {
    req.log.warn(
      "Did not successfully manage to update profile with skip event, passkey registration prompt may not be suppressed"
    );
  }

  const userJourneyEvent = USER_JOURNEY_EVENTS.SKIP_CREATE_PASSKEY;
  return res.redirect(
    await getNextPathAndUpdateJourney(req, res, userJourneyEvent)
  );
}

async function handleCreatePasskey(
  service: AmcAuthorizeInterface,
  req: Request,
  res: Response
) {
  const { sessionId, clientSessionId, persistentSessionId } = res.locals;
  req.log.info("User has chosen to create a passkey");

  const result = await service.getRedirectUrl(
    sessionId,
    clientSessionId,
    persistentSessionId,
    req,
    AMC_JOURNEY_TYPES.PASSKEY_CREATE
  );

  if (!result.success) {
    req.log.error("Failed to get redirect URL for passkey creation");
    throw new BadRequestError(result.data.message, result.data.code);
  }

  req.log.info(
    "Got successful response with redirect uri for AMC from the backend"
  );

  if (!result.data.amcCookie) {
    req.log.error("AMC cookie is undefined");
    throw new Error("AMC cookie is undefined");
  }

  res.cookie("amc", result.data.amcCookie, {
    secure: true,
    httpOnly: true,
    domain: getAccountDomain(),
  });

  req.log.info(
    "Got redirect url from authorize endpoint. Redirecting user to AMC for passkey creation"
  );
  const userJourneyEvent = USER_JOURNEY_EVENTS.CREATE_PASSKEY_INIT;
  await getNextPathAndUpdateJourney(req, res, userJourneyEvent);

  const redirectUrl = result.data.redirectUrl;

  res.redirect(redirectUrl);
}
