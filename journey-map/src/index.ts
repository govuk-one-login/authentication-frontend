import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";
import { generateStateMachineMermaid } from "./mermaid.js";
import { authStateMachine } from "di-auth/src/components/common/state-machine/state-machine.js";
import { getAuthStateMachineConfig } from "./stateMachineHelpers/auth-state-machine-helper.js";
import { getContactFormStateMachineConfig } from "./stateMachineHelpers/contact-form-state-machine-helper.js";
import i18next from "i18next";
import translations from "../../src/locales/en/translation.json";
import { utf8HexToString } from "./helpers/hex-helper.js";

declare global {
  interface Window {
    // Used to define a click handler for use in the mermaid
    onStateClick?: (id: string, name: string) => void;
    // Initialiser functions called from the HTML
    initialiseAuthJourneyMap: () => void;
    initialiseContactFormJourneyMap: () => void;
  }
}

export interface StateMachineConfig {
  states: State[];
  transitions: Transition[];
}

export interface State {
  name: string;
  id: string;
  onClick?: () => void;
}

export interface Transition {
  source: string;
  target: string;
  event?: string;
  condition?: string;
  optional?: boolean;
}

const DOUBLE_CLICK_WINDOW_MILLIS = 1000;

const diagramElement = document.getElementById("diagram") as HTMLDivElement;

const setupHeaderToggleClickHandlers = (
  headerContent: HTMLDivElement,
  headerToggle: HTMLButtonElement
): void => {
  headerToggle.addEventListener("click", () => {
    if (headerContent.classList.toggle("hidden")) {
      headerToggle.innerText = "Show header";
    } else {
      headerToggle.innerText = "Hide header";
    }
  });
};

const renderMermaidSvg = async (stateMachineMermaid: string): Promise<void> => {
  console.debug(stateMachineMermaid);

  mermaid.initialize({
    maxTextSize: 100000,
    startOnLoad: false,
    themeVariables: {
      useMaxWidth: false,
    },
    flowchart: {
      padding: 0,
      wrappingWidth: 800,
    },
    // Required to enable links and callbacks
    // This is (relatively) safe, as we only run on our own generated mermaid charts
    securityLevel: "loose",
  });
  const { svg, bindFunctions } = await mermaid.render(
    "diagramSvg",
    stateMachineMermaid
  );
  diagramElement.innerHTML = svg;
  bindFunctions?.(diagramElement);
  svgPanZoom("#diagramSvg", {
    controlIconsEnabled: true,
    dblClickZoomEnabled: false,
    preventMouseEventsDefault: false,
  });
};

const setupStateClickHandlers = (states: State[]): void => {
  let currentHighlight: string | undefined;
  let timeClicked = 0;

  const highlightState = (hexId: string): void => {
    const stateId = utf8HexToString(hexId);
    const matchingState = states.find((state) => state.id === stateId);

    const clickAction = matchingState?.onClick;
    // Open template on double-click if applicable
    if (
      currentHighlight === hexId &&
      Date.now() - timeClicked < DOUBLE_CLICK_WINDOW_MILLIS
    ) {
      if (clickAction) clickAction();
    }

    // Remove existing highlights
    Array.from(document.getElementsByClassName("highlight")).forEach((edge) =>
      edge.classList.remove("highlight", "outgoingEdge", "incomingEdge")
    );

    // Add new highlights
    Array.from(document.getElementsByClassName("flowchart-link")).forEach(
      (edge) => {
        const splitEdgeId = edge.id.split("_");
        const edgeStartNodeId = splitEdgeId[1];
        const edgeEndNodeId = splitEdgeId[2];

        if (edgeStartNodeId === hexId) {
          edge.classList.add("highlight", "outgoingEdge");
        }

        if (edgeEndNodeId === hexId) {
          edge.classList.add("highlight", "incomingEdge");
        }
      }
    );
    Array.from(document.getElementsByClassName("node"))
      .filter((node) => {
        // Remove trailing number from node ID
        const splitNodeId = node.id.split("-");
        splitNodeId.pop();
        const joinedNodeId = splitNodeId.join("-");

        return joinedNodeId === `flowchart-${hexId}`;
      })
      .forEach((node) => node.classList.add("highlight"));

    Array.from(document.querySelectorAll(`[data-source="${hexId}"]`)).forEach(
      (label) => label.classList.add("highlight", "outgoingEdge")
    );
    Array.from(document.querySelectorAll(`[data-target="${hexId}"]`)).forEach(
      (label) => label.classList.add("highlight", "incomingEdge")
    );

    currentHighlight = hexId;
    timeClicked = Date.now();
  };

  window.onStateClick = async (id: string): Promise<void> => {
    highlightState(id);
  };
};

const setupFormHandlers = (
  contextInput: HTMLTextAreaElement,
  contextToggle: HTMLInputElement,
  form: HTMLFormElement,
  renderFormStateMachine: (formElement: HTMLFormElement) => Promise<void>
): void => {
  form.addEventListener("change", async (event) => {
    event.preventDefault();
    await renderFormStateMachine(form);
  });
  contextToggle.addEventListener("change", (event) => {
    event.preventDefault();
    contextInput.classList.toggle("hidden");
  });
  contextInput.value = JSON.stringify(authStateMachine.context, undefined, 2);
};

const initialiseAuthJourneyMap = async () => {
  const headerContent = document.getElementById(
    "header-content"
  ) as HTMLDivElement;
  const headerToggle = document.getElementById(
    "header-toggle"
  ) as HTMLButtonElement;
  const form = document.getElementById("configuration-form") as HTMLFormElement;
  const contextToggle = document.getElementById(
    "overrideContext"
  ) as HTMLInputElement;
  const contextInput = document.getElementById(
    "context"
  ) as HTMLTextAreaElement;

  const renderAuthStateMachine = async (formElement: HTMLFormElement) => {
    const stateMachineConfig = getAuthStateMachineConfig(formElement);
    const stateMachineMermaid =
      await generateStateMachineMermaid(stateMachineConfig);
    await renderMermaidSvg(stateMachineMermaid);
    setupStateClickHandlers(stateMachineConfig.states);
  };

  setupHeaderToggleClickHandlers(headerContent, headerToggle);
  setupFormHandlers(contextInput, contextToggle, form, renderAuthStateMachine);

  await renderAuthStateMachine(form);
};

const initialiseContactFormJourneyMap = async () => {
  await i18next.init({
    lng: "en",
    resources: {
      en: {
        translation: translations,
      },
    },
  });

  const stateMachineConfig = getContactFormStateMachineConfig();

  setupStateClickHandlers(stateMachineConfig.states);

  const stateMachineMermaid =
    await generateStateMachineMermaid(stateMachineConfig);
  await renderMermaidSvg(stateMachineMermaid);
};

interface JourneyMapType {
  initialiser: () => Promise<void>;
  name: string;
}

const JOURNEY_MAP_TYPE_QUERY_PARAM = "journeyMapType";
const JOURNEY_MAP_TYPES = new Map<string, JourneyMapType>([
  ["auth", { initialiser: initialiseAuthJourneyMap, name: "Authentication" }],
  [
    "contact-form",
    { initialiser: initialiseContactFormJourneyMap, name: "Contact Form" },
  ],
]);

export const initialiseJourneyMap = async () => {
  // Initialise header bar
  const headerBar = document.getElementById("header-bar") as HTMLDivElement;
  JOURNEY_MAP_TYPES.forEach((journeyMapType, journeyMapId) => {
    const pageLink = document.createElement("a");
    pageLink.innerText = journeyMapType.name;
    pageLink.href = `?${JOURNEY_MAP_TYPE_QUERY_PARAM}=${journeyMapId}`;
    headerBar.insertAdjacentElement("beforeend", pageLink);
  });

  // Initialise diagram
  const urlParams = new URLSearchParams(window.location.search);
  const journeyMapType = urlParams.get(JOURNEY_MAP_TYPE_QUERY_PARAM) || "auth";
  const journeyMapInitialiser =
    JOURNEY_MAP_TYPES.get(journeyMapType)?.initialiser;

  if (journeyMapInitialiser) {
    await journeyMapInitialiser();
  } else {
    console.error("No journey map found");
  }
};
