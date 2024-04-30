import { NextFunction, Request, Response } from "express";

export function allowUserJourneyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const nextPath = req.session.user.journey.nextPath;

  if (
    nextPath !== req.path &&
    !req.session.user.journey.optionalPaths.includes(req.path)
  ) {
    req.log.warn(
      `User tried invalid journey to ${
        req.path
      }, but session indicates they should be on ${nextPath} for session ${
        res.locals.sessionId
      } and optionalPaths ${req.session.user.journey.optionalPaths.join()}`
    );
    return res.redirect(nextPath);
  }

  next();
}
