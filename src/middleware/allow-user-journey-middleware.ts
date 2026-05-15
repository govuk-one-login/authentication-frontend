import type { NextFunction, Request, Response } from "express";
import { authStateMachine } from "../components/common/state-machine/state-machine.js";
import { saveSessionState } from "../components/common/constants.js";
import {
  goBackHistoryAllowList,
  isBackTransition,
} from "../components/common/state-machine/go-back-history.js";

export function transitionForbidden(
  req: Request,
  passkeysEnabled?: boolean
): boolean {
  const nextPath = req.session.user.journey.nextPath;

  const isOnNextPath = nextPath === req.path;
  const isOnOptionalPath = req.session.user.journey.optionalPaths.includes(
    req.path
  );
  const isGoingBack =
    passkeysEnabled &&
    goBackHistoryAllowList.includes(nextPath) &&
    isBackTransition(req.session.user.journey.goBackHistory ?? [], req.path);

  return !isOnNextPath && !isOnOptionalPath && !isGoingBack;
}

export function allowUserJourneyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const passkeysEnabled =
    res.locals.supportPasskeyRegistration || res.locals.supportPasskeyUsage;
  if (transitionForbidden(req, passkeysEnabled)) {
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

  next();
}

export async function allowAndPersistUserJourneyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const passkeysEnabled =
    res.locals.supportPasskeyRegistration || res.locals.supportPasskeyUsage;
  if (transitionForbidden(req, passkeysEnabled)) {
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

  if (req.session.user.journey.optionalPaths.includes(req.path)) {
    req.session.user.journey.nextPath = req.path;
    req.session.user.journey.optionalPaths =
      authStateMachine.states[req.path]?.meta?.optionalPaths || [];
    await saveSessionState(req);
  }

  next();
}
