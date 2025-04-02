export var REVERIFICATION_ERROR_CODE;
(function (REVERIFICATION_ERROR_CODE) {
    REVERIFICATION_ERROR_CODE["NO_IDENTITY_AVAILABLE"] = "no_identity_available";
    REVERIFICATION_ERROR_CODE["IDENTITY_CHECK_INCOMPLETE"] = "identity_check_incomplete";
    REVERIFICATION_ERROR_CODE["IDENTITY_CHECK_FAILED"] = "identity_check_failed";
    REVERIFICATION_ERROR_CODE["IDENTITY_DID_NOT_MATCH"] = "identity_did_not_match";
})(REVERIFICATION_ERROR_CODE || (REVERIFICATION_ERROR_CODE = {}));
export function isReverificationResultFailedResponse(response) {
    const responseAsFailed = response;
    return responseAsFailed.success !== undefined && !responseAsFailed.success;
}
