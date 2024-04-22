import { Request } from "express";
import { AccountInterventionStatus } from "../components/account-intervention/types";

export function isSuspendedWithoutUserActions(
  status: AccountInterventionStatus
): boolean {
  return (
    status.temporarilySuspended &&
    !status.reproveIdentity &&
    !status.passwordResetRequired
  );
}

export function passwordHasBeenResetMoreRecentlyThanInterventionApplied(
  req: Request,
  status: AccountInterventionStatus
): boolean {
  return (
    req.session.user.passwordResetTime !== undefined &&
    req.session.user.passwordResetTime > parseInt(status.appliedAt)
  );
}
