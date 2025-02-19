import { authStateMachine } from "../components/common/state-machine/state-machine";
import { UserJourney } from "../types";

export const getPermittedJourneyForPath = (path: string): UserJourney => ({
  nextPath: path,
  optionalPaths: authStateMachine.states[path]?.meta?.optionalPaths || [],
});
