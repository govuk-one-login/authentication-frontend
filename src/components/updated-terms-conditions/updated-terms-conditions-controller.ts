import type { Request, Response } from "express";
import type { ExpressRouteFunc } from "../../types.js";
import { BadRequestError } from "../../utils/error.js";
import { EXTERNAL_LINKS, PATH_NAMES } from "../../app.constants.js";
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
    const termsAndConditionsResult = req.body.termsAndConditionsResult;
    const resultMap: any = {
      govUk: EXTERNAL_LINKS.GOV_UK,
      contactUs: PATH_NAMES.CONTACT_US + "?supportType=PUBLIC",
    };

    if (["govUk", "contactUs"].includes(termsAndConditionsResult)) {
      req.session.destroy((error) => {
        if (error) {
          req.log.error(`Failed to delete session: ${error}`);
        } else {
          req.log.info("Session destroyed");
        }
      });
      return res.redirect(resultMap[termsAndConditionsResult]);
    }

    if (termsAndConditionsResult === "accept") {
      const result = await service.updateProfile(
        sessionId,
        clientSessionId,
        email,
        {
          updateProfileType: UpdateType.UPDATE_TERMS_CONDS,
          profileInformation: true,
        },
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
          USER_JOURNEY_EVENTS.TERMS_AND_CONDITIONS_ACCEPTED,
          {
            isIdentityRequired: req.session.user.isIdentityRequired,
          }
        )
      );
    }
  };
}
