import type { NextFunction, Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../components/common/constants.js";
import { USER_JOURNEY_EVENTS } from "../components/common/state-machine/state-machine.js";
import { accountInterventionService } from "../components/account-intervention/account-intervention-service.js";
import type { ExpressRouteFunc } from "../types.js";
import { supportAccountInterventions } from "../config.js";
import { logger } from "../utils/logger.js";
import {
  isSuspendedWithoutUserActions,
  passwordHasBeenResetMoreRecentlyThanInterventionApplied,
} from "../utils/interventions.js";
export function accountInterventionsMiddleware(
  handleSuspendedStatus: boolean,
  handlePasswordResetStatus: boolean,
  authenticated?: boolean,
  service = accountInterventionService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (supportAccountInterventions()) {
      const email = req.session.user.email.toLowerCase();
      const { sessionId, clientSessionId, persistentSessionId } = res.locals;

      const accountInterventionsResponse =
        await service.accountInterventionStatus(
          sessionId,
          email,
          clientSessionId,
          persistentSessionId,
          req,
          authenticated
        );

      if (accountInterventionsResponse.data.blocked) {
        return res.redirect(
          await getNextPathAndUpdateJourney(
            req,
            USER_JOURNEY_EVENTS.PERMANENTLY_BLOCKED_INTERVENTION
          )
        );
      } else if (
        accountInterventionsResponse.data.passwordResetRequired &&
        handlePasswordResetStatus
      ) {
        if (
          !passwordHasBeenResetMoreRecentlyThanInterventionApplied(
            req,
            accountInterventionsResponse.data
          )
        ) {
          return res.redirect(
            await getNextPathAndUpdateJourney(
              req,
              USER_JOURNEY_EVENTS.PASSWORD_RESET_INTERVENTION
            )
          );
        } else {
          logger.info(
            `User reset password since intervention applied. Skipping intervention. User reset password timestamp: ${req.session.user.passwordResetTime} intervention applied at timestamp: ${accountInterventionsResponse.data.appliedAt}`
          );
        }
      } else if (
        isSuspendedWithoutUserActions(accountInterventionsResponse.data) &&
        handleSuspendedStatus
      ) {
        return res.redirect(
          await getNextPathAndUpdateJourney(
            req,
            USER_JOURNEY_EVENTS.TEMPORARILY_BLOCKED_INTERVENTION
          )
        );
      }
    }

    return next();
  };
}
