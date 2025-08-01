import type { AnyEventObject, StateNode, TransitionDefinition } from "xstate";
import type {
  AuthStateContext,
  AuthStateMachine,
} from "di-auth/src/components/common/state-machine/state-machine.js";
import { authStateMachine } from "di-auth/src/components/common/state-machine/state-machine.js";

export interface Options {
  includeOptional: boolean;
  context?: AuthStateContext;
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
  `graph ${graphDirection}`;

const renderState = ({ name, id }: State): string => `    ${id}(${name})`;

const renderTransition = ({
  source,
  target,
  event,
  condition,
  optional,
}: Transition): string => {
  const label = event ? `|${event}<br/>${condition ?? ""}|` : "";
  const arrow = optional ? "-.->" : "-->";
  return `    ${source}${arrow}${label}${target}`;
};

const renderClickHandler = ({ id }: State): string =>
  `    click ${id} call onStateClick(${JSON.stringify(id)})`;

const getSingleTransitionTarget = (
  transition: TransitionDefinition<AuthStateContext, AnyEventObject>
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

const getTransitions = (
  stateMachine: AuthStateMachine,
  state: StateNode,
  options: Options
): Transition[] => {
  const transitions: Transition[] = [];

  if (options.context) {
    // Only show applicable transitions
    state.events.forEach((event) => {
      const { value } = stateMachine.transition(
        state.key,
        event,
        options.context
      );
      transitions.push({
        source: state.id,
        target: `${stateMachine.id}.${value}`,
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
      const targetId = `${stateMachine.id}.${target}`;
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
  stateMachine: AuthStateMachine,
  options: Options
): { states: State[]; transitions: Transition[] } => {
  const xStates = [...stateMachine.initialStateNodes];

  const states: State[] = [];
  const transitions: Transition[] = [];

  for (const state of xStates) {
    // Record this state
    states.push({ name: state.key, id: state.id });

    // Find transitions from this state
    const activeTransitions = getTransitions(stateMachine, state, options);
    transitions.push(...activeTransitions);

    // Add target states to the list of states to traverse
    activeTransitions.forEach((transition) => {
      if (stateMachine.stateIds.includes(transition.target)) {
        if (!xStates.some((state) => state.id === transition.target)) {
          xStates.push(stateMachine.getStateNodeById(transition.target));
        }
      } else {
        states.push({
          name: transition.target.substring(stateMachine.id.length + 1),
          id: transition.target,
        });
      }
    });
  }

  return { states, transitions };
};

export const renderStateMachine = async (options: Options): Promise<string> => {
  const { states, transitions } = getReachableStatesAndTransitions(
    authStateMachine,
    options
  );

  return `
${getMermaidHeader("LR")}
${states.map(renderState).join("\n")}
${states.map(renderClickHandler).join("\n")}
${transitions.map(renderTransition).join("\n")}
  `;
};
