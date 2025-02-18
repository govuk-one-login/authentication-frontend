import { exec } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { authStateMachine } from "../src/components/common/state-machine/state-machine";
import { PATH_NAMES } from "../src/app.constants";

const allSupportedStates = Object.keys(authStateMachine.config.states);
function renderCode(str: string) {
  return `<code>${str}</code>`;
}

function renderRouterPageLink(path: string): string {
  const entry = Object.entries(PATH_NAMES).find(([, val]) => val === path);
  const pathName = entry ? entry[0] : null;
  const link = pathName
    ? `https://github.com/search?q=repo%3Agovuk-one-login%2Fauthentication-frontend+PATH_NAMES.${pathName}+routes&type=code`
    : "";
  return `<a title="PATH_NAMES.${pathName}" href="${link}">${renderCode(
    path
  )}</a> <sup class="external-link-icon">↪️</sup>`;
}

function renderCurrentPageLink(path: string): string {
  const supported = allSupportedStates.includes(path);

  if (supported) {
    return `
    <a href="#current-state-${path}">${renderCode(path)}</a>`;
  } else {
    return `<span title="Path does not exist in the state machine">${renderCode(
      path
    )} <sup class="unsupported-icon">🚫</sup></span>`;
  }
}

function getPathKey(currentState: string) {
  return Object.keys(PATH_NAMES).find(
    (key) => PATH_NAMES[key as keyof typeof PATH_NAMES] === currentState
  );
}

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>User Journey Paths</title>
    <style>
      table, th, td {
        border: 1px solid black;
        border-collapse: collapse;
      }
      dt {
        font-weight: bold;
      }
      ol.eventConsequences {
        list-style-type: none;
        counter-reset: item;
      }
      ol.eventConsequences li::before {
        content: "️️⬇️ ";
        counter-increment: item;
        opacity: 0.5;
      }
      ol.eventConsequences li:last-child::before {
        content: "🏁 ";
        opacity: 0.8;
      }
      ol.eventConsequences .condition {
        opacity: 0.5;
      }
      sup.external-link-icon,
      sup.unsupported-icon {
        opacity: 0.8;
        font-size: 0.6rem;
      }
      :target {
        background-color: yellow;
      }
    </style>
</head>
<body>
    <h1>User Journey</h1>
    <h2>Path Transitions</h2>
    <table>
        <tr>
          <th>Current Path</th>
          <th>Input Event</th>
          <th>Next Path</th>
          <th>Optional Paths</th>
        </tr>
        ${allSupportedStates
          .map((currentState) => {
            const allEvents =
              authStateMachine.config.states[currentState].on || {};
            const eventNames = Object.keys(allEvents);
            const optionalPaths =
              authStateMachine.config.states[currentState]?.meta?.optionalPaths;

            if (eventNames.length === 0) {
              return `
                  <tr>
                    <td id="current-state-${currentState}" colspan="5">${renderRouterPageLink(
                      currentState
                    )} 🏁</td>
                  </tr>
              `;
            }

            return eventNames
              .map((eventName, eventNameIndex) => {
                const eventConsequences = (allEvents as any)[eventName];
                return `
                  <tr>
                    ${
                      eventNameIndex === 0
                        ? `<td id="current-state-${currentState}" rowspan="${
                            eventNames.length
                          }">${renderCode(getPathKey(currentState))} ${renderRouterPageLink(currentState)}</td>`
                        : ""
                    }
                    <td>${renderCode(eventName)}</td>
                    <td><ol class="eventConsequences">${eventConsequences
                      .map((consequence: any) => {
                        if (typeof consequence === "string") {
                          return `<li>${renderCode(getPathKey(consequence))} ${renderCurrentPageLink(
                            consequence
                          )}</li>`;
                        }

                        return `<li>${consequence.target
                          .map(
                            (t: string) =>
                              `${renderCode(getPathKey(t))} ${renderCurrentPageLink(t)}`
                          )
                          .join(",")}${
                          consequence.cond
                            ? ` <i class="condition" title="Definition: ${authStateMachine.options.guards[
                                consequence.cond
                              ].toString()}">when ${renderCode(
                                consequence.cond
                              )}</i>`
                            : ""
                        }</li>`;
                      })
                      .join("\n")}</ol></td>
                    ${
                      eventNameIndex === 0
                        ? `<td rowspan="${eventNames.length}"><ul>${
                            optionalPaths
                              ? optionalPaths
                                  .map(
                                    (p: string) =>
                                      `<li>${renderCode(getPathKey(p))} ${renderCurrentPageLink(p)}</li>`
                                  )
                                  .join("\n")
                              : "N/A"
                          }</ul></td>`
                        : ""
                    }
                  </tr>
              `;
              })
              .join("\n");
          })
          .join("\n")}
    </table>
</body>
</html>
`;

const tempFilePath = path.join(os.tmpdir(), "temp.html");
fs.writeFileSync(tempFilePath, htmlContent);

exec(`open "${tempFilePath}"`, (error, stdout, stderr) => {
  /* eslint-disable no-console */
  if (error) {
    console.error(`Error opening URL: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`Error output: ${stderr}`);
    return;
  }
  console.log(`Rendered page opened`);
  /* eslint-enable no-console */
});
