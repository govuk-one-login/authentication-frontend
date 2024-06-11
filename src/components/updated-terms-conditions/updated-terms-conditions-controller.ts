import { Request, Response } from "express";
import { ExpressRouteFunc } from "../../types";
import { BadRequestError } from "../../utils/error";
import { EXTERNAL_LINKS, PATH_NAMES } from "../../app.constants";
import {
  UpdateProfileServiceInterface,
  UpdateType,
} from "../common/update-profile/types";
import { updateProfileService } from "../common/update-profile/update-profile-service";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { getNextPathAndUpdateJourney } from "../common/constants";

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
          req.path,
          USER_JOURNEY_EVENTS.TERMS_AND_CONDITIONS_ACCEPTED,
          {
            isIdentityRequired: req.session.user.isIdentityRequired,
          },
          sessionId
        )
      );
    }
  };
}
