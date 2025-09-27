export interface State {
  name: string;
  id: string;
}

export interface Transition {
  source: string;
  target: string;
  event?: string;
  condition?: string;
  optional?: boolean;
}

export default abstract class StateMachineHelper {
  abstract getReachableStatesAndTransitions(): {
    states: State[];
    transitions: Transition[];
  };
}
