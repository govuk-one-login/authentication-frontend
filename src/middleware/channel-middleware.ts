import type { NextFunction, Request, Response } from "express";
import { CHANNEL, COOKIES_CHANNEL } from "../app.constants.js";
export function channelMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.session?.user?.channel) {
    setChannelFlags(res, req.session.user.channel);
  } else if (req.cookies[COOKIES_CHANNEL]) {
    setChannelFlags(res, req.cookies[COOKIES_CHANNEL]);
  } else {
    setChannelFlags(res, CHANNEL.WEB);
  }

  next();
}

function setChannelFlags(res: Response, channel?: string): void {
  res.locals.strategicAppChannel = channel === CHANNEL.STRATEGIC_APP;
  res.locals.webChannel = channel === CHANNEL.WEB;
  res.locals.genericApp = channel === CHANNEL.GENERIC_APP;
  res.locals.isApp =
    channel === CHANNEL.STRATEGIC_APP || channel === CHANNEL.GENERIC_APP;
}
