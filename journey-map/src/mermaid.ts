import { TransitionDefinition } from "xstate";
import { authStateMachine } from "../../src/components/common/state-machine/state-machine.js";

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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSingleTransitionTarget = (
  transition: TransitionDefinition<any, any>
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

export const renderStateMachine = (): string => {
  const states: State[] = Object.entries(authStateMachine.states).map(
    ([name, node]) => ({ name, id: node.id })
  );

  const transitions: Transition[] = Object.values(
    authStateMachine.states
  ).flatMap((node) =>
    node.transitions.map((transition) => ({
      source: node.id,
      target: getSingleTransitionTarget(transition),
      event: transition.eventType,
      condition: transition.cond?.name ?? undefined,
    }))
  );

  // Add optional transitions
  Object.values(authStateMachine.states).forEach((node) =>
    node.meta?.optionalPaths?.forEach((target: string) => {
      const targetId = `${authStateMachine.id}.${target}`;
      if (!states.some(({ id }) => id === targetId)) {
        states.push({ name: target, id: targetId });
      }
      transitions.push({
        source: node.id,
        target: targetId,
        optional: true,
      });
    })
  );

  return `
${getMermaidHeader("LR")}
${states.map(renderState).join("\n")}
${states.map(renderClickHandler).join("\n")}
${transitions.map(renderTransition).join("\n")}
  `;
};
