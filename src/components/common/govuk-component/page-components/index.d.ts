import type { GovukComponentArgsMap } from "../govuk-component-types/index.js";

export type PageComponent = {
  [K in keyof GovukComponentArgsMap]: {
    type: K;
    args: GovukComponentArgsMap[K];
  };
}[keyof GovukComponentArgsMap];
