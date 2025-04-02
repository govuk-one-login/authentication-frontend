import { HTTP_STATUS_CODES, PLACEHOLDER_REPLACEMENTS, CONTACT_US_FIELD_MAX_LENGTH, CONTACT_US_COUNTRY_MAX_LENGTH, } from "../app.constants";
export const isObjectEmpty = (obj) => {
    return Object.keys(obj).length === 0;
};
const convertStringBooleanPropertiesToJavaScriptBoolean = (reqBody) => {
    return Object.keys(reqBody).reduce((reducedObject, reqBodyObjectKey) => {
        const valueInOriginalReqBody = reqBody[reqBodyObjectKey];
        if (valueInOriginalReqBody === "true") {
            reducedObject[reqBodyObjectKey] = true;
        }
        if (valueInOriginalReqBody === "false") {
            reducedObject[reqBodyObjectKey] = false;
        }
        reducedObject[reqBodyObjectKey] = valueInOriginalReqBody;
        return reducedObject;
    }, {});
};
export function formatValidationError(key, validationMessage) {
    const error = {};
    error[key] = {
        text: validationMessage,
        href: `#${key}`,
    };
    return error;
}
export function deDuplicateErrorList(errors) {
    const errorValues = Object.values(errors);
    return [
        ...new Map(errorValues.map((error) => {
            return [error.text, error];
        })).values(),
    ];
}
export function replaceErrorMessagePlaceholders(errors, placeholders) {
    return errors.map((error) => {
        const errorCopy = { ...error };
        placeholders.forEach((placeholder) => {
            if (errorCopy.text?.includes(placeholder.search)) {
                errorCopy.text = errorCopy.text.replace(placeholder.search, placeholder.replacement);
            }
        });
        return errorCopy;
    });
}
export function renderBadRequest(res, req, template, errors, postValidationLocals) {
    res.status(HTTP_STATUS_CODES.BAD_REQUEST);
    const uniqueErrorList = deDuplicateErrorList(errors);
    const uniqueErrorListWithPlaceholdersReplaced = replaceErrorMessagePlaceholders(uniqueErrorList, PLACEHOLDER_REPLACEMENTS);
    const errorParams = {
        errors,
        errorList: uniqueErrorListWithPlaceholdersReplaced,
        ...convertStringBooleanPropertiesToJavaScriptBoolean(req.body),
        language: req.i18n.language,
        contactUsFieldMaxLength: CONTACT_US_FIELD_MAX_LENGTH,
        contactCountryMaxLength: CONTACT_US_COUNTRY_MAX_LENGTH,
    };
    const params = postValidationLocals
        ? { ...errorParams, ...postValidationLocals }
        : errorParams;
    return res.render(template, params);
}
