import { createPasswordService } from "./create-password-service";
import { BadRequestError } from "../../utils/error";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { ERROR_CODES, getNextPathAndUpdateJourney } from "../common/constants";
import { formatValidationError, renderBadRequest, } from "../../utils/validation";
export function createPasswordGet(req, res) {
    return res.render("create-password/index.njk");
}
export function createPasswordPost(service = createPasswordService()) {
    return async function (req, res) {
        const result = await service.signUpUser(res.locals.sessionId, res.locals.clientSessionId, req.session.user.email, req.body.password, res.locals.persistentSessionId, req);
        if (!result.success) {
            if (result.data.code === ERROR_CODES.PASSWORD_IS_COMMON) {
                const error = formatValidationError("password", req.t("pages.createPassword.password.validationError.commonPassword"));
                return renderBadRequest(res, req, "create-password/index.njk", error);
            }
            throw new BadRequestError(result.data.message, result.data.code);
        }
        return res.redirect(await getNextPathAndUpdateJourney(req, req.path, USER_JOURNEY_EVENTS.PASSWORD_CREATED, {
            requiresTwoFactorAuth: true,
        }, res.locals.sessionId));
    };
}
