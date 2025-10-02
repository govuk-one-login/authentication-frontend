import {
  AuthStateContext,
  INTERMEDIATE_STATES,
} from "di-auth/src/components/common/state-machine/state-machine.js";
import StateMachineHelper from "./stateMachineHelpers/StateMachineHelper.js";
import { stringToUtf8Hex } from "./helpers/hexHelper.js";

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

const renderState = (
  state: State,
  stateMachineHelper: StateMachineHelper
): string => {
  const { id, name } = state;
  const hexId = stringToUtf8Hex(id);
  if (stateMachineHelper.getClickAction(state)) {
    return `    ${hexId}(${name}):::page`;
  }
  if (Object.values(INTERMEDIATE_STATES).includes(name)) {
    return `    ${hexId}(${name}):::intermediateState`;
  }
  return `    ${hexId}(${name})`;
};

const renderTransition = ({
  source,
  target,
  event,
  condition,
  optional,
}: Transition): string => {
  const hexSource = stringToUtf8Hex(source);
  const hexTarget = stringToUtf8Hex(target);
  const lineBreak = event && condition ? "<br/>" : "";
  const label =
    event || condition
      ? `|<span data-source="${hexSource}" data-target="${hexTarget}">${event ?? ""}${lineBreak}${condition ?? ""}</span>|`
      : "";
  const arrow = optional ? "-.->" : "-->";
  return `    ${hexSource}${arrow}${label}${hexTarget}`;
};

const renderClickHandler = ({ id, name }: State): string => {
  const hexId = stringToUtf8Hex(id);
  return `    click ${hexId} call onStateClick(${JSON.stringify(hexId)},${JSON.stringify(name)})`;
};

export const generateStateMachineMermaid = async (
  stateMachineHelper: StateMachineHelper
): Promise<string> => {
  const { states, transitions } =
    stateMachineHelper.getReachableStatesAndTransitions();

  return `
${getMermaidHeader("LR")}
${states.map((state) => renderState(state, stateMachineHelper)).join("\n")}
${states.map(renderClickHandler).join("\n")}
${transitions.map(renderTransition).join("\n")}
  `;
};
