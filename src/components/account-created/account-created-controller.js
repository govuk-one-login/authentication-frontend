import { getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
export function accountCreatedGet(req, res) {
    const { serviceType, name } = req.session.client;
    res.render("account-created/index.njk", {
        serviceType,
        name,
        strategicAppChannel: res.locals.strategicAppChannel,
    });
}
export async function accountCreatedPost(req, res) {
    const nextPath = await getNextPathAndUpdateJourney(req, req.path, USER_JOURNEY_EVENTS.ACCOUNT_CREATED, res.locals.sessionId);
    res.redirect(nextPath);
}
