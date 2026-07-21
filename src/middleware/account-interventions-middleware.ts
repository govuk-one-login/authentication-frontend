import type { NextFunction, Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../components/common/state-machine/state-machine-executor.js";
import { USER_JOURNEY_EVENTS } from "../components/common/state-machine/state-machine.js";
import { accountInterventionService } from "../components/account-intervention/account-intervention-service.js";
import type { ExpressRouteFunc } from "../types.js";
import { supportAccountInterventions } from "../config.js";
import {
  isSuspendedWithoutUserActions,
  passwordHasBeenResetMoreRecentlyThanInterventionApplied,
} from "../utils/interventions.js";
import type { AccountInterventionStatus } from "../components/account-intervention/types.js";

type Options = {
  handleSuspendedStatus: boolean;
  handlePasswordResetStatus: boolean;
  handleReproveIdentity: boolean;
  onRedirect?: (req: Request) => void;
};

export function accountInterventionsMiddleware(
  options: Options,
  authenticated?: boolean,
  service = accountInterventionService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response, next: NextFunction) {
    if (!supportAccountInterventions()) {
      return next();
    }

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

    const accountInterventionRedirect = await getAccountInterventionsRedirect(
      req,
      res,
      accountInterventionsResponse.data,
      options
    );
    if (accountInterventionRedirect) {
      options.onRedirect?.(req);
      return res.redirect(accountInterventionRedirect);
    }

    return next();
  };
}

async function getAccountInterventionsRedirect(
  req: Request,
  res: Response,
  accountInterventionsResponse: AccountInterventionStatus,
  options: Options
): Promise<string | null> {
  const {
    handleSuspendedStatus,
    handlePasswordResetStatus,
    handleReproveIdentity,
  } = options;
  if (accountInterventionsResponse.blocked) {
    return await getNextPathAndUpdateJourney(
      req,
      res,
      USER_JOURNEY_EVENTS.PERMANENTLY_BLOCKED_INTERVENTION
    );
  } else if (
    accountInterventionsResponse.passwordResetRequired &&
    handlePasswordResetStatus
  ) {
    if (
      !passwordHasBeenResetMoreRecentlyThanInterventionApplied(
        req,
        accountInterventionsResponse
      )
    ) {
      return await getNextPathAndUpdateJourney(
        req,
        res,
        USER_JOURNEY_EVENTS.PASSWORD_RESET_INTERVENTION
      );
    } else {
      req.log.info(
        `User reset password since intervention applied. Skipping intervention. User reset password timestamp: ${req.session.user.passwordResetTime} intervention applied at timestamp: ${accountInterventionsResponse.appliedAt}`
      );
    }
  } else if (
    isSuspendedWithoutUserActions(accountInterventionsResponse) &&
    handleSuspendedStatus
  ) {
    return await getNextPathAndUpdateJourney(
      req,
      res,
      USER_JOURNEY_EVENTS.TEMPORARILY_BLOCKED_INTERVENTION
    );
  } else if (
    accountInterventionsResponse.reproveIdentity &&
    handleReproveIdentity
  ) {
    return await getNextPathAndUpdateJourney(
      req,
      res,
      USER_JOURNEY_EVENTS.REPROVE_IDENTITY_INTERVENTION
    );
  }
  return null;
}
