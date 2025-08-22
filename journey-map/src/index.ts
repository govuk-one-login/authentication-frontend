import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";
import type { Options } from "./mermaid.js";
import { renderStateMachine } from "./mermaid.js";
import type { AuthStateContext } from "di-auth/src/components/common/state-machine/state-machine.js";
import { authStateMachine } from "di-auth/src/components/common/state-machine/state-machine.js";
import { pages } from "di-auth/src/components/templates/pages.js";

declare global {
  interface Window {
    // Used to define a click handler for use in the mermaid
    onStateClick?: (id: string, name: string) => void;
  }
}

const DOUBLE_CLICK_WINDOW_MILLIS = 1000;

const diagramElement = document.getElementById("diagram") as HTMLDivElement;
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
const contextInput = document.getElementById("context") as HTMLTextAreaElement;

const setupHeaderToggleClickHandlers = (): void => {
  headerToggle.addEventListener("click", () => {
    if (headerContent.classList.toggle("hidden")) {
      headerToggle.innerText = "Show header";
    } else {
      headerToggle.innerText = "Hide header";
    }
  });
};

const parseContext = (formData: FormData): AuthStateContext | undefined => {
  if (formData.getAll("otherOption").includes("overrideContext")) {
    try {
      return JSON.parse(formData.get("context") as string);
    } catch (err) {
      console.warn(err);
    }
  }
};

const parseOptions = (formData: FormData): Options => ({
  includeOptional: formData.getAll("otherOption").includes("includeOptional"),
  context: parseContext(formData),
});

const render = async (): Promise<void> => {
  const options = parseOptions(new FormData(form));
  const stateMachineMermaid = await renderStateMachine(options);
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

const setupStateClickHandlers = (): void => {
  let currentHighlight: string | undefined;
  let timeClicked = 0;

  const highlightState = (id: string, name: string): void => {
    // Open template on double-click if applicable
    if (
      currentHighlight === id &&
      Date.now() - timeClicked < DOUBLE_CLICK_WINDOW_MILLIS
    ) {
      if (pages[name]) {
        const variant = Array.isArray(pages[name]) ? pages[name][0].name : "";
        window.open(
          `/templates${name}?lng=en&pageVariant=${encodeURIComponent(variant)}`,
          "_blank"
        );
      }
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

        if (edgeStartNodeId === id) {
          edge.classList.add("highlight", "outgoingEdge");
        }

        if (edgeEndNodeId === id) {
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

        return joinedNodeId === `flowchart-${id}`;
      })
      .forEach((node) => node.classList.add("highlight"));

    currentHighlight = id;
    timeClicked = Date.now();
  };

  window.onStateClick = async (id: string, name: string): Promise<void> => {
    highlightState(id, name);
  };
};

const setupFormHandlers = (): void => {
  form.addEventListener("change", async (event) => {
    event.preventDefault();
    await render();
  });
  contextToggle.addEventListener("change", (event) => {
    event.preventDefault();
    contextInput.classList.toggle("hidden");
  });
  contextInput.value = JSON.stringify(authStateMachine.context, undefined, 2);
};

const initialise = async (): Promise<void> => {
  setupHeaderToggleClickHandlers();
  setupStateClickHandlers();
  setupFormHandlers();
  render();
};

initialise().catch(console.error);
