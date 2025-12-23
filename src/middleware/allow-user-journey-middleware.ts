import type { NextFunction, Request, Response } from "express";
import { authStateMachine } from "../components/common/state-machine/state-machine.js";
import { saveSessionState } from "../components/common/constants.js";

export function transitionForbidden(req: Request): boolean {
  const nextPath = req.session.user.journey.nextPath;
  const previousPath =
    req.session.user.journey?.goBackHistory?.slice(-1)[0] || "/";

  return (
    nextPath !== req.path &&
    previousPath !== req.path &&
    !req.session.user.journey.optionalPaths.includes(req.path)
  );
}

export async function allowUserJourneyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (transitionForbidden(req)) {
    const nextPath = req.session.user.journey.nextPath;
    req.log.warn(
      `User tried invalid journey to ${
        req.path
      }, but session indicates they should be on ${nextPath} for session ${
        res.locals.sessionId
      } and optionalPaths ${req.session.user.journey.optionalPaths.join()}`
    );
    return res.redirect(nextPath);
  }

  await historyMiddleware(req, res);

  next();
}

async function historyMiddleware(req: Request, res: Response) {
  const previousPath = req.session.user.journey?.goBackHistory?.slice(-1)[0] || "/";

  if (previousPath === req.path) {
    req.session.user.journey.nextPath = previousPath;
    req.session.user.journey.goBackHistory.pop();
    await saveSessionState(req);
  }
}

export async function allowAndPersistUserJourneyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  if (transitionForbidden(req)) {
    const nextPath = req.session.user.journey.nextPath;
    req.log.warn(
      `User tried invalid journey to ${
        req.path
      }, but session indicates they should be on ${nextPath} for session ${
        res.locals.sessionId
      } and optionalPaths ${req.session.user.journey.optionalPaths.join()}`
    );
    return res.redirect(nextPath);
  }

  await historyMiddleware(req, res);

  if (req.session.user.journey.optionalPaths.includes(req.path)) {
    req.session.user.journey.nextPath = req.path;
    req.session.user.journey.optionalPaths =
      authStateMachine.states[req.path]?.meta?.optionalPaths || [];
    await saveSessionState(req);
  }

  next();
}
