import type { Request, Response } from "express";
import { authStateMachine, type AuthStateContext } from "./state-machine.js";
import { saveSessionState } from "../constants.js";
import type { State } from "xstate";

// Extend the state interface to be more precise
interface AuthState extends State<AuthStateContext> {
  value: string;
  meta: {
    [id: string]: {
      optionalPaths?: string[];
    };
  };
};

export async function getNextPathAndUpdateJourney(
  req: Request,
  res: Response,
  event: string,
  ctx?: AuthStateContext,
): Promise<string> {
  const sessionId = res.locals.sessionId;

  const nextState = authStateMachine.transition(req.path, event, ctx) as AuthState;

  req.session.user.journey = {
    nextPath: nextState.value,
    optionalPaths:
      Object.keys(nextState.meta).length > 0
        ? nextState.meta["AUTH." + nextState.value].optionalPaths
        : [],
  };

  await saveSessionState(req);

  req.log.info(
    `User journey transitioned from ${req.path} to ${nextState.value} with session id ${sessionId}`
  );

  if (!nextState) {
    throw Error(
      `Invalid user journey. No transition found from ${req.path} with event ${event} with sessionId ${sessionId}`
    );
  }

  return nextState.value;
}
