import { StateMachineConfig } from "../index.js";

export default abstract class StateMachineHelper {
  abstract getReachableStatesAndTransitions(): StateMachineConfig;
}
