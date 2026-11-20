import type { AmcAuthorizeInterface } from "../amc-service/types.js";
import { amcAuthorizeService } from "../amc-service/amc-authorize-service.js";
import type { ExpressRouteFunc } from "../../types.js";
import type { Request, Response } from "express";
import { BadRequestError } from "../../utils/error.js";
import { AMC_JOURNEY_TYPES } from "../../app.constants.js";
import { accountInterventionService } from "../account-intervention/account-intervention-service.js";
import type { AccountInterventionsInterface } from "../account-intervention/types.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine.js";

export function ssadAuthorizeGet(
  service: AmcAuthorizeInterface = amcAuthorizeService(),
  accountInterventionsService: AccountInterventionsInterface = accountInterventionService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response): Promise<void> {
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const { email } = req.session.user;

    const accountInterventionsResponse =
      await accountInterventionsService.accountInterventionStatus(
        sessionId,
        email,
        clientSessionId,
        persistentSessionId,
        req
      );

    if (accountInterventionsResponse.data.passwordResetRequired) {
      req.log.info("User not eligible for SSAD")
      return res.redirect(
        await getNextPathAndUpdateJourney(req, res, USER_JOURNEY_EVENTS.NOT_ELIGIBLE_FOR_SSAD)
      )
    }

    const result = await service.getRedirectUrl(
      sessionId,
      clientSessionId,
      persistentSessionId,
      req,
      AMC_JOURNEY_TYPES.SELF_SERVE_ACCOUNT_DELETION
    );

    if (!result.success) {
      throw new BadRequestError(result.data.message, result.data.code);
    }

    const redirectUrl = result.data.redirectUrl;

    res.redirect(redirectUrl);
  };
}
