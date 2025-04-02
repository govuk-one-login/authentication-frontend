import { CHANNEL, COOKIES_CHANNEL } from "../app.constants";
export function channelMiddleware(req, res, next) {
    if (req.session?.user?.channel) {
        setChannelFlags(res, req.session.user.channel);
    }
    else if (req.cookies[COOKIES_CHANNEL]) {
        setChannelFlags(res, req.cookies[COOKIES_CHANNEL]);
    }
    else {
        setChannelFlags(res, CHANNEL.WEB);
    }
    next();
}
function setChannelFlags(res, channel) {
    res.locals.strategicAppChannel = channel === CHANNEL.STRATEGIC_APP;
    res.locals.webChannel = channel === CHANNEL.WEB;
}
