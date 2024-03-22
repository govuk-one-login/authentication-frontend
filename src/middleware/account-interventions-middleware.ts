import { NextFunction, Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../components/common/constants";
import { USER_JOURNEY_EVENTS } from "../components/common/state-machine/state-machine";
import { accountInterventionService } from "../components/account-intervention/account-intervention-service";
import { ExpressRouteFunc } from "../types";
import { supportAccountInterventions } from "../config";
import { logger } from "../utils/logger";
import {
  isSuspendedWithoutUserActions,
  passwordHasBeenResetMoreRecentlyThanInterventionApplied,
} from "../utils/interventions";

export function accountInterventionsMiddleware(
  handleSuspendedStatus: boolean,
  handlePasswordResetStatus: boolean,
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
          req.ip,
          clientSessionId,
          persistentSessionId
        );

      if (accountInterventionsResponse.data.blocked) {
        return res.redirect(
          getNextPathAndUpdateJourney(
            req,
            req.path,
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
            getNextPathAndUpdateJourney(
              req,
              req.path,
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
          getNextPathAndUpdateJourney(
            req,
            req.path,
            USER_JOURNEY_EVENTS.TEMPORARILY_BLOCKED_INTERVENTION
          )
        );
      }
    }

    return next();
  };
}
