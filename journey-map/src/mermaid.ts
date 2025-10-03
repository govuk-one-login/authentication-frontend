import { INTERMEDIATE_STATES } from "di-auth/src/components/common/state-machine/state-machine.js";
import { stringToUtf8Hex } from "./helpers/hex-helper.js";
import { State, StateMachineConfig, Transition } from "./index.js";

const getMermaidHeader = (graphDirection: "TD" | "LR"): string =>
  `flowchart ${graphDirection}
    classDef page fill:#ae8,stroke:#000;
    classDef intermediateState fill:#ec8,stroke:#000`;

const renderState = (state: State): string => {
  const { id, name } = state;
  const hexId = stringToUtf8Hex(id);
  if (state.onClick) {
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

const renderClickHandler = ({ id }: State): string => {
  const hexId = stringToUtf8Hex(id);
  return `    click ${hexId} call onStateClick(${JSON.stringify(hexId)})`;
};

export const generateStateMachineMermaid = async (
  stateMachineConfig: StateMachineConfig
): Promise<string> => {
  const { states, transitions } = stateMachineConfig;

  return `
${getMermaidHeader("LR")}
${states.map((state) => renderState(state)).join("\n")}
${states.map(renderClickHandler).join("\n")}
${transitions.map(renderTransition).join("\n")}
  `;
};
