import type { GovukRadioButton } from "./govuk-radio-button.d.js";
import type { GovukTag } from "./govuk-tag.d.js";

interface GovukDisplayComponent<T> {
  component: T;
}

interface GovukFieldComponent<T> extends GovukDisplayComponent<T> {
  validation: ValidationChainFunc;
}

interface GovukComponentArgsMap {
  govukRadioButton: GovukFieldComponent<GovukRadioButton>;
  govukTag: GovukDisplayComponent<GovukTag>;
}

export type GovukComponent = {
  [K in keyof GovukComponentArgsMap]: {
    type: K;
    args: GovukComponentArgsMap[K];
  };
}[keyof GovukComponentArgsMap];
