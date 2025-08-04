// Govuk components
// These components are not typed fully/correctly

interface GovukRadioButton {
  name: string;
  items: string[];
}

interface GovukTag {
  text: string;
}

// Composing Govuk components and possible validation

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

// Using GovukComponent

export const exampleForm: GovukComponent[] = [
  {
    type: "govukRadioButton",
    args: {
      component: {
        name: "country",
        items: ["England", "Wales", "Scotland", "Northern Ireland"],
      },
      validation: [],
    },
  },
  {
    type: "govukTag",
    args: {
      component: {
        text: "Test",
      },
    },
  },
];
