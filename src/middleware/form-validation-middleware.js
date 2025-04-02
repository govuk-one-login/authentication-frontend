import { validationResult } from "express-validator";
import { isObjectEmpty, renderBadRequest } from "../utils/validation";
import { isReauth, isUpliftRequired } from "../utils/request";
export const validationErrorFormatter = ({ msg, param, }) => {
    return {
        text: msg,
        href: `#${param}`,
    };
};
export function validateBodyMiddleware(template, postValidationLocals) {
    return (req, res, next) => {
        const errors = validationResult(req)
            .formatWith(validationErrorFormatter)
            .mapped();
        const locals = typeof postValidationLocals !== "undefined"
            ? postValidationLocals(req)
            : undefined;
        if (!isObjectEmpty(errors)) {
            return renderBadRequest(res, req, template, errors, locals);
        }
        next();
    };
}
export function validateBodyMiddlewareUpliftTemplate(upliftTemplate, defaultTemplate, postValidationLocals) {
    return (req, res, next) => {
        const template = isUpliftRequired(req) ? upliftTemplate : defaultTemplate;
        const errors = validationResult(req)
            .formatWith(validationErrorFormatter)
            .mapped();
        const locals = typeof postValidationLocals !== "undefined"
            ? postValidationLocals(req)
            : undefined;
        if (!isObjectEmpty(errors)) {
            return renderBadRequest(res, req, template, errors, locals);
        }
        next();
    };
}
export function validateBodyMiddlewareReauthTemplate(reAuthTemplate, defaultTemplate, postValidationLocals) {
    return (req, res, next) => {
        const template = isReauth(req) ? reAuthTemplate : defaultTemplate;
        const errors = validationResult(req)
            .formatWith(validationErrorFormatter)
            .mapped();
        const locals = typeof postValidationLocals !== "undefined"
            ? postValidationLocals(req)
            : undefined;
        if (!isObjectEmpty(errors)) {
            return renderBadRequest(res, req, template, errors, locals);
        }
        next();
    };
}
