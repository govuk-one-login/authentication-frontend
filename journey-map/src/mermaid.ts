import type { AnyEventObject, StateNode, TransitionDefinition } from "xstate";
import { authStateMachine } from "../../src/components/common/state-machine/state-machine.js";

export type AuthContext = typeof authStateMachine.context;

export interface Options {
  includeOptional: boolean;
  context?: AuthContext;
}

interface State {
  name: string;
  id: string;
}

interface Transition {
  source: string;
  target: string;
  event?: string;
  condition?: string;
  optional?: boolean;
}

const getMermaidHeader = (graphDirection: "TD" | "LR"): string =>
  // These styles should be kept in sync with the key in style.css
  `graph ${graphDirection}
    classDef process fill:#ffa,stroke:#000;
    classDef page fill:#ae8,stroke:#000;
    classDef cri fill:#faf,stroke:#000;
    classDef journey_transition fill:#aaf,stroke:#000;
    classDef error_transition fill:#f99,stroke:#000;
    classDef other fill:#f3f2f1,stroke:#000;
    classDef nested_journey fill:#aaedff,stroke:#000;`;

const renderState = ({ name, id }: State): string => `    ${id}(${name})`;

const renderTransition = ({
  source,
  target,
  event,
  condition,
  optional,
}: Transition): string =>
  `    ${source}-${optional ? "." : ""}->|${event ?? ""}<br/>${condition ?? ""}|${target}`;

const renderClickHandler = ({ id }: State): string =>
  `    click ${id} call onStateClick(${JSON.stringify(id)})`;

const getSingleTransitionTarget = (
  transition: TransitionDefinition<AuthContext, AnyEventObject>
): string => {
  if (!transition.target?.length) {
    throw new Error(`Transition from ${transition.source.id} missing a target`);
  }
  if (transition.target.length > 1) {
    throw new Error(
      `Transition from ${transition.source.id} has multiple targets`
    );
  }
  return transition.target[0].id;
};

const getTransitions = (state: StateNode, options: Options): Transition[] => {
  const transitions: Transition[] = [];

  if (options.context) {
    // Only show applicable transitions
    state.events.forEach((event) => {
      const { value } = authStateMachine.transition(
        state.key,
        event,
        options.context
      );
      transitions.push({
        source: state.id,
        target: `${authStateMachine.id}.${value}`,
        event: event,
      });
    });
  } else {
    // Show all transitions
    state.transitions.forEach((transition) =>
      transitions.push({
        source: state.id,
        target: getSingleTransitionTarget(transition),
        event: transition.eventType,
        condition: transition.cond?.name ?? undefined,
      })
    );
  }

  if (options.includeOptional) {
    // Add optional transitions
    state.meta?.optionalPaths?.forEach((target: string) => {
      const targetId = `${authStateMachine.id}.${target}`;
      transitions.push({
        source: state.id,
        target: targetId,
        optional: true,
      });
    });
  }

  return transitions;
};

const getReachableStatesAndTransitions = (
  options: Options
): { states: State[]; transitions: Transition[] } => {
  const xStates = [...authStateMachine.initialStateNodes];

  const states: State[] = [];
  const transitions: Transition[] = [];

  for (const state of xStates) {
    // Record this state
    states.push({ name: state.key, id: state.id });

    // Find transitions from this state
    const activeTransitions = getTransitions(state, options);
    transitions.push(...activeTransitions);

    // Add target states to the list of states to traverse
    activeTransitions.forEach((transition) => {
      if (authStateMachine.stateIds.includes(transition.target)) {
        if (!xStates.some((state) => state.id === transition.target)) {
          xStates.push(authStateMachine.getStateNodeById(transition.target));
        }
      } else {
        states.push({
          name: transition.target.substring(authStateMachine.id.length + 1),
          id: transition.target,
        });
      }
    });
  }

  return { states, transitions };
};

export const renderStateMachine = (options: Options): string => {
  const { states, transitions } = getReachableStatesAndTransitions(options);

  return `
${getMermaidHeader("LR")}
${states.map(renderState).join("\n")}
${states.map(renderClickHandler).join("\n")}
${transitions.map(renderTransition).join("\n")}
  `;
};
