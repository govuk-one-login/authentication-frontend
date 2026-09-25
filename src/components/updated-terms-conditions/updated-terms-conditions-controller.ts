import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import { BadRequestError } from "../../utils/error.js";
import type { UpdateProfileServiceInterface } from "../common/update-profile/types.js";
import { UpdateType } from "../common/update-profile/types.js";
import { updateProfileService } from "../common/update-profile/update-profile-service.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
export function updatedTermsConditionsGet(req: Request, res: Response): void {
  res.render("updated-terms-conditions/index.njk");
}

export function updatedTermsConditionsPost(
  service: UpdateProfileServiceInterface = updateProfileService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;

    const result = await service.updateProfile(
      sessionId,
      clientSessionId,
      email,
      UpdateType.UPDATE_TERMS_CONDS,
      persistentSessionId,
      req
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    res.redirect(
      await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.TERMS_AND_CONDITIONS_ACCEPTED
      )
    );
  };
}
