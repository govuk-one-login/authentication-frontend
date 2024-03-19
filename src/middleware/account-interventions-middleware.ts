import { NextFunction, Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../components/common/constants";
import { USER_JOURNEY_EVENTS } from "../components/common/state-machine/state-machine";
import { accountInterventionService } from "../components/account-intervention/account-intervention-service";
import { ExpressRouteFunc } from "../types";
import { supportAccountInterventions } from "../config";
import { AccountInterventionStatus } from "../components/account-intervention/types";
import { logger } from "../utils/logger";

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

function isSuspendedWithoutUserActions(
  status: AccountInterventionStatus
): boolean {
  return (
    status.temporarilySuspended &&
    !status.reproveIdentity &&
    !status.passwordResetRequired
  );
}

function passwordHasBeenResetMoreRecentlyThanInterventionApplied(
  req: Request,
  status: AccountInterventionStatus
) {
  return (
    req.session.user.passwordResetTime !== undefined &&
    req.session.user.passwordResetTime > parseInt(status.appliedAt)
  );
}
