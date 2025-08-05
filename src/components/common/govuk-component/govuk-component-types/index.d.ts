import type { GovukRadioButton } from "./govuk-radio-button.d.js";
import type { GovukTag } from "./govuk-tag.d.js";

interface GovukDisplayComponent<T> {
  component: T;
}

interface GovukFieldComponent<T> extends GovukDisplayComponent<T> {
  validation: ValidationChainFunc;
}

export interface GovukComponentArgsMap {
  govukRadioButton: GovukFieldComponent<GovukRadioButton>;
  govukTag: GovukDisplayComponent<GovukTag>;
}
