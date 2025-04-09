import { authStateMachine } from "../../src/components/common/state-machine/state-machine.js";
import type { UserJourney } from "../../src/types.js";
export const getPermittedJourneyForPath = (path: string): UserJourney => ({
  nextPath: path,
  optionalPaths: authStateMachine.states[path]?.meta?.optionalPaths || [],
});
