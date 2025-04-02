import { PATH_NAMES } from "../../../app.constants";
export function passwordResetRequiredGet(req, res) {
    req.session.user.withinForcedPasswordResetJourney = true;
    res.render("account-intervention/password-reset-required/index.njk", {
        resetPasswordCheckEmailURL: PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL,
    });
}
