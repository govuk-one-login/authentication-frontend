import type { Request, Response } from "express";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";

export async function journeyGet(req: Request, res: Response): Promise<void> {
  const { event, page } = req.params;
  const previousPageFromSession = req.session.user.journey.nextPath;

  if (!event || !page) {
    req.log.warn("Missing params");
    return res.redirect(previousPageFromSession);
  }

  const previousPageFromRouteParams = `/${page}`;

  if (previousPageFromRouteParams !== previousPageFromSession) {
    req.log.warn(
      `Cannot use /journey route. Previous page in session ${previousPageFromSession} not previous page in params ${previousPageFromRouteParams}`
    );
    return res.redirect(previousPageFromSession);
  }

  const nextPath = await getNextPathAndUpdateJourney(
    req,
    res,
    event as string,
    previousPageFromSession
  );

  return res.redirect(nextPath);
}
