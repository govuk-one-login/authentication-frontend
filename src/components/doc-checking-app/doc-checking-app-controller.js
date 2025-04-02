import { BadRequestError } from "../../utils/error";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { docCheckingAppService } from "./doc-checking-app-service";
export function docCheckingAppGet(service = docCheckingAppService()) {
    return async function (req, res) {
        const { sessionId, clientSessionId, persistentSessionId } = res.locals;
        const result = await service.docCheckingAppAuthorize(sessionId, clientSessionId, persistentSessionId, req);
        if (!result.success) {
            throw new BadRequestError(result.data.message, result.data.code);
        }
        getNextPathAndUpdateJourney(req, req.path, USER_JOURNEY_EVENTS.DOC_CHECKING_AUTH_REDIRECT, null, sessionId);
        return res.redirect(result.data.redirectUri);
    };
}
