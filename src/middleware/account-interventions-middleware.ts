import { NextFunction, Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../components/common/constants";
import { USER_JOURNEY_EVENTS } from "../components/common/state-machine/state-machine";
import { accountInterventionService } from "../components/account-intervention/account-intervention-service";
import { ExpressRouteFunc } from "../types";
import { supportAccountInterventions } from "../config";

export function accountInterventionsMiddleware(
  handleSuspendedStatus: boolean,
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
        accountInterventionsResponse.data.temporarilySuspended &&
        handleSuspendedStatus
      ) {
        return res.redirect(
          getNextPathAndUpdateJourney(
            req,
            req.path,
            USER_JOURNEY_EVENTS.TEMPORARILY_BLOCKED_INTERVENTION
          )
        );
      } else if (accountInterventionsResponse.data.passwordResetRequired) {
        return res.redirect(
          getNextPathAndUpdateJourney(
            req,
            req.path,
            USER_JOURNEY_EVENTS.PASSWORD_RESET_INTERVENTION
          )
        );
      }
    }

    return next();
  };
}
