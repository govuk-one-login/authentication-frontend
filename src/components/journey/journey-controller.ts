import type { Request, Response } from "express";
import { authStateMachine } from "../common/state-machine/state-machine.js";
import { getNextPathAndUpdateJourney } from "../common/state-machine/state-machine-executor.js";
import type { JourneyRouteParams } from "./types.js";

export async function journeyGet(req: Request, res: Response): Promise<void> {
  const { event, page }: JourneyRouteParams = req.params;
  const previousPageFromSession = req.session.user.journey.nextPath;

  if (
    !routeParamsDefined(req, event, page) ||
    !routePageMatchesSessionPage(req, page, previousPageFromSession) ||
    !eventPermittedForPage(req, previousPageFromSession, event)
  ) {
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

function routeParamsDefined(req: Request, event?: string, page?: string) {
  if (!event || !page) {
    req.log.warn("Missing params");
    return false;
  }
  return true;
}

function routePageMatchesSessionPage(
  req: Request,
  page: string,
  previousPageFromSession: string
) {
  const previousPageFromRouteParams = `/${page}`;
  if (previousPageFromRouteParams !== previousPageFromSession) {
    req.log.warn(
      `Cannot use /journey route. Previous page in session ${previousPageFromSession} not previous page in params ${previousPageFromRouteParams}`
    );
    return false;
  }
  return true;
}

function eventPermittedForPage(
  req: Request,
  previousPageFromSession: string,
  event: string
) {
  const permittedJourneyRouteEventsForPath =
    authStateMachine.states[previousPageFromSession].meta
      ?.permittedJourneyRouteEvents;
  if (
    permittedJourneyRouteEventsForPath?.length === 0 ||
    !permittedJourneyRouteEventsForPath?.includes(event)
  ) {
    req.log.error(`Event ${event} not allowed via /journey path`);
    return false;
  }
  return true;
}
