import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";
import { Options, renderStateMachine } from "./mermaid.js";

declare global {
  interface Window {
    // Used to define a click handler for use in the mermaid
    onStateClick?: (name: string) => void;
  }
}

const diagramElement = document.getElementById("diagram") as HTMLDivElement;
const headerContent = document.getElementById(
  "header-content",
) as HTMLDivElement;
const headerToggle = document.getElementById(
  "header-toggle",
) as HTMLButtonElement;
const form = document.getElementById("configuration-form") as HTMLFormElement;

const setupHeaderToggleClickHandlers = (): void => {
  headerToggle.addEventListener("click", () => {
    if (headerContent.classList.toggle("hidden")) {
      headerToggle.innerText = "Show header";
    } else {
      headerToggle.innerText = "Hide header";
    }
  });
};

const parseOptions = (formData: FormData): Options => ({
  includeOptional: formData.getAll("otherOption").includes("includeOptional"),
});

const render = async (): Promise<void> => {
  const options = parseOptions(new FormData(form));
  const stateMachineMermaid = renderStateMachine(options);
  console.log(stateMachineMermaid);

  mermaid.initialize({
    maxTextSize: 100000,
    startOnLoad: false,
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
  const highlightState = (state: string): void => {
  // Remove existing highlights
  Array.from(document.getElementsByClassName("highlight")).forEach((edge) =>
    edge.classList.remove("highlight", "outgoingEdge", "incomingEdge")
  );

  // Add new highlights
  Array.from(document.getElementsByClassName(`LS-${state}`)).forEach((edge) =>
    edge.classList.add("highlight", "outgoingEdge")
  );
  Array.from(document.getElementsByClassName(`LE-${state}`)).forEach((edge) =>
    edge.classList.add("highlight", "incomingEdge")
  );
  Array.from(document.getElementsByClassName("node"))
    .filter((node) => node.id.startsWith(`flowchart-${state}-`))
    .forEach((node) => node.classList.add("highlight"));
  };

  window.onStateClick = async (state: string): Promise<void> => {
    highlightState(state);
  };
}

const initialise = async (): Promise<void> => {
  setupHeaderToggleClickHandlers();
  setupStateClickHandlers();
  render();
  form.addEventListener("change", async (event) => {
    event.preventDefault();
    await render();
  });
};

initialise().catch(console.error);
