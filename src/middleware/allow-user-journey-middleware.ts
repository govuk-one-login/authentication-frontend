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
      `User tried invalid journey to ${req.path} from ${nextPath} for session ${
        res.locals.sessionId
      } optionalPaths ${req.session.user.journey.optionalPaths.join()}`
    );
    return res.redirect(nextPath);
  }

  next();
}
