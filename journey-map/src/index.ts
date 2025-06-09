import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";
import { renderStateMachine } from "./mermaid.js";

declare global {
  interface Window {
    // Used to define a click handler for use in the mermaid
    onStateClick?: (name: string) => void;
  }
}

const diagramElement = document.getElementById("diagram") as HTMLDivElement;

const render = async (): Promise<void> => {
  const options = {
    includeOptional: false,
  };
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

render().catch(console.error);
