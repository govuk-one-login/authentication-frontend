import type { NextFunction, Request, Response } from "express";
import { saveSessionState } from "../components/common/constants.js";
import { authStateMachine } from "../components/common/state-machine/state-machine.js";
import {
  goBackHistoryAllowList,
  isBackTransition,
} from "../components/common/state-machine/go-back-history.js";

export async function goBackMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const pathNavigatedFrom = req.session.user.journey.nextPath;
  const goBackHistory = req.session.user.journey.goBackHistory ?? [];
  const lastPathInGoBackHistory = goBackHistory[goBackHistory.length - 1];

  if (isBackTransition(goBackHistory, req.path)) {
    if (!goBackHistoryAllowList.includes(pathNavigatedFrom)) {
      req.log.warn(
        `User tried to use goBackHistory from invalid path ${pathNavigatedFrom} in session and goBackHistory ${goBackHistory}`
      );
      return res.redirect(pathNavigatedFrom);
    }

    req.session.user.journey.goBackHistory.pop();
    req.session.user.journey.nextPath = lastPathInGoBackHistory;
    req.session.user.journey.optionalPaths =
      authStateMachine.states[lastPathInGoBackHistory]?.meta?.optionalPaths ||
      [];

    await saveSessionState(req);
  }

  next();
}
