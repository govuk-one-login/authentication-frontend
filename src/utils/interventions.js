export function isSuspendedWithoutUserActions(status) {
    return (status.temporarilySuspended &&
        !status.reproveIdentity &&
        !status.passwordResetRequired);
}
export function passwordHasBeenResetMoreRecentlyThanInterventionApplied(req, status) {
    return (req.session.user.passwordResetTime !== undefined &&
        req.session.user.passwordResetTime > status.appliedAt);
}
