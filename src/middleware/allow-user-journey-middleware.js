import { authStateMachine } from "../components/common/state-machine/state-machine";
import { saveSessionState } from "../components/common/constants";
export function transitionForbidden(req) {
    const nextPath = req.session.user.journey.nextPath;
    return (nextPath !== req.path &&
        !req.session.user.journey.optionalPaths.includes(req.path));
}
export function allowUserJourneyMiddleware(req, res, next) {
    if (transitionForbidden(req)) {
        const nextPath = req.session.user.journey.nextPath;
        req.log.warn(`User tried invalid journey to ${req.path}, but session indicates they should be on ${nextPath} for session ${res.locals.sessionId} and optionalPaths ${req.session.user.journey.optionalPaths.join()}`);
        return res.redirect(nextPath);
    }
    next();
}
export async function allowAndPersistUserJourneyMiddleware(req, res, next) {
    if (transitionForbidden(req)) {
        const nextPath = req.session.user.journey.nextPath;
        req.log.warn(`User tried invalid journey to ${req.path}, but session indicates they should be on ${nextPath} for session ${res.locals.sessionId} and optionalPaths ${req.session.user.journey.optionalPaths.join()}`);
        return res.redirect(nextPath);
    }
    if (req.session.user.journey.optionalPaths.includes(req.path)) {
        req.session.user.journey.nextPath = req.path;
        req.session.user.journey.optionalPaths =
            authStateMachine.states[req.path]?.meta?.optionalPaths || [];
        await saveSessionState(req);
    }
    next();
}
