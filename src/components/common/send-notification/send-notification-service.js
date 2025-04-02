import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";
import { createApiResponse, getInternalRequestConfigWithSecurityHeaders, http, } from "../../../utils/http";
export function sendNotificationService(axios = http) {
    const sendNotification = async function (sessionId, clientSessionId, email, notificationType, persistentSessionId, userLanguage, req, journeyType, phoneNumber, requestNewCode) {
        const payload = {
            email,
            notificationType,
        };
        if (phoneNumber) {
            payload.phoneNumber = phoneNumber;
        }
        if (requestNewCode) {
            payload.requestNewCode = requestNewCode;
        }
        if (journeyType) {
            payload.journeyType = journeyType;
        }
        const response = await axios.client.post(API_ENDPOINTS.SEND_NOTIFICATION, payload, getInternalRequestConfigWithSecurityHeaders({
            sessionId: sessionId,
            clientSessionId: clientSessionId,
            persistentSessionId: persistentSessionId,
            validationStatuses: [
                HTTP_STATUS_CODES.NO_CONTENT,
                HTTP_STATUS_CODES.BAD_REQUEST,
            ],
            userLanguage: userLanguage,
        }, req, API_ENDPOINTS.SEND_NOTIFICATION));
        return createApiResponse(response, [
            HTTP_STATUS_CODES.OK,
            HTTP_STATUS_CODES.NO_CONTENT,
        ]);
    };
    return {
        sendNotification,
    };
}
