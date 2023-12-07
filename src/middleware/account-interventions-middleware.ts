import { NextFunction, Request, Response } from "express";
import { Http } from "../utils/http";
import { API_ENDPOINTS, PATH_NAMES } from "../app.constants";
import { USER_JOURNEY_EVENTS } from "../components/common/state-machine/state-machine";
import { getNextPathAndUpdateJourney } from "../components/common/constants";

export async function accountInterventionsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
  axios: Http,
  nextPathAndUpdateJourneyFunction: (p1: any, p2: string, p3: string, p4?: any, p5?: string) => string
) {
  const accountInterventionsResponse = await axios.client.post("/account-interventions", { "email": req.session.user.email });

  if (accountInterventionsResponse.data["passwordResetRequired"]) {
    //TODO context and sessionId
    nextPathAndUpdateJourneyFunction(req, PATH_NAMES.ENTER_MFA, USER_JOURNEY_EVENTS.PASSWORD_RESET_INTERVENTION)

  }
  return next();
}