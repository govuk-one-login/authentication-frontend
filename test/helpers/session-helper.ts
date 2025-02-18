import { authStateMachine } from "../../src/components/common/state-machine/state-machine";
import { UserJourney } from "../../src/types";

export const getPermittedJourneyForPath = (path: string): UserJourney => ({
  nextPath: path,
  optionalPaths: authStateMachine.states[path]?.meta?.optionalPaths || [],
});
