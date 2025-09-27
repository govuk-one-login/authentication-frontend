import {
  AuthStateContext,
  INTERMEDIATE_STATES,
} from "di-auth/src/components/common/state-machine/state-machine.js";
import { pages } from "di-auth/src/components/templates/pages.js";
import StateMachineHelper from "./journeyMap/StateMachineHelper.js";

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
  `flowchart ${graphDirection}
    classDef page fill:#ae8,stroke:#000;
    classDef intermediateState fill:#ec8,stroke:#000`;

const renderState = ({ name, id }: State): string => {
  if (pages[name]) {
    return `    ${id}(${name}):::page`;
  }
  if (Object.values(INTERMEDIATE_STATES).includes(name)) {
    return `    ${id}(${name}):::intermediateState`;
  }
  return `    ${id}(${name})`;
};

const renderTransition = ({
  source,
  target,
  event,
  condition,
  optional,
}: Transition): string => {
  const lineBreak = event && condition ? "<br/>" : "";
  const label =
    event || condition
      ? `|<span data-source="${source}" data-target="${target}">${event ?? ""}${lineBreak}${condition ?? ""}</span>|`
      : "";
  const arrow = optional ? "-.->" : "-->";
  return `    ${source}${arrow}${label}${target}`;
};

const renderClickHandler = ({ id, name }: State): string =>
  `    click ${id} call onStateClick(${JSON.stringify(id)},${JSON.stringify(name)})`;

export const generateStateMachineMermaid = async (
  stateMachineHelper: StateMachineHelper
): Promise<string> => {
  const { states, transitions } =
    stateMachineHelper.getReachableStatesAndTransitions();

  return `
${getMermaidHeader("LR")}
${states.map(renderState).join("\n")}
${states.map(renderClickHandler).join("\n")}
${transitions.map(renderTransition).join("\n")}
  `;
};
