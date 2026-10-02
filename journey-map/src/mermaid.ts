import { INTERMEDIATE_STATES } from "di-auth/src/components/common/state-machine/state-machine.js";
import { stringToUtf8Hex } from "./helpers/hex-helper.js";
import { State, StateGroup, StateMachineConfig, Transition } from "./index.js";

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

const getArrow = (optional?: boolean, reversible?: boolean): string => {
  if (optional) return "-.->";
  if (reversible) return "--o";
  return "-->";
};

const renderTransition = ({
  source,
  target,
  event,
  condition,
  optional,
  reversible,
}: Transition): string => {
  const hexSource = stringToUtf8Hex(source);
  const hexTarget = stringToUtf8Hex(target);
  const lineBreak = event && condition ? "<br/>" : "";
  const reversibleAttr = reversible ? ` data-reversible="true"` : "";
  const label =
    event || condition
      ? `|<span data-source="${hexSource}" data-target="${hexTarget}"${reversibleAttr}>${event ?? ""}${lineBreak}${condition ?? ""}</span>|`
      : "";
  const arrow = getArrow(optional, reversible);
  return `    ${hexSource}${arrow}${label}${hexTarget}`;
};

const renderClickHandler = ({ id }: State): string => {
  const hexId = stringToUtf8Hex(id);
  return `    click ${hexId} call onStateClick(${JSON.stringify(hexId)})`;
};

const escapeGroupTitle = (title: string): string =>
  title.replace(/"/g, "&quot;");

/**
 * Renders the state node definitions, wrapping any states that belong to a
 * group inside a Mermaid subgraph. States are matched to a group by their
 * `name` (the PATH_NAMES value). Any state not assigned to a group is rendered
 * outside of any subgraph.
 */
const renderGroupedStates = (states: State[], groups: StateGroup[]): string => {
  // Map state name -> states (there may be more than one state sharing a name)
  const statesByName = new Map<string, State[]>();
  states.forEach((state) => {
    const existing = statesByName.get(state.name);
    if (existing) {
      existing.push(state);
    } else {
      statesByName.set(state.name, [state]);
    }
  });

  const assignedStateIds = new Set<string>();
  const lines: string[] = [];

  groups.forEach((group, index) => {
    const groupStates = group.states
      .flatMap((name) => statesByName.get(name) ?? [])
      .filter((state) => !assignedStateIds.has(state.id));

    if (groupStates.length === 0) {
      return;
    }

    lines.push(
      `    subgraph group${index}["${escapeGroupTitle(group.title)}"]`
    );
    groupStates.forEach((state) => {
      assignedStateIds.add(state.id);
      lines.push(renderState(state));
    });
    lines.push(`    end`);
  });

  // Render any states that were not assigned to a group
  states
    .filter((state) => !assignedStateIds.has(state.id))
    .forEach((state) => {
      assignedStateIds.add(state.id);
      lines.push(renderState(state));
    });

  return lines.join("\n");
};

export const generateStateMachineMermaid = async (
  stateMachineConfig: StateMachineConfig
): Promise<string> => {
  const { states, transitions, groups } = stateMachineConfig;

  const stateDefinitions =
    groups && groups.length > 0
      ? renderGroupedStates(states, groups)
      : states.map((state) => renderState(state)).join("\n");

  return `
${getMermaidHeader("LR")}
${stateDefinitions}
${states.map(renderClickHandler).join("\n")}
${transitions.map(renderTransition).join("\n")}
  `;
};
