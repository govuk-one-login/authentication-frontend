import { getContactFormStructure } from "./contact-us-structure.js";

interface ThemeRadioButtons {
  value: string;
  text: string;
}

export function getThemeRadioButtonsFromContactFormStructure(): ThemeRadioButtons[] {
  return Array.from(getContactFormStructure())
    .filter(([, theme]) => !theme.isHidden)
    .map(([themeName, theme]) => ({
      value: themeName,
      text: theme.radio.mainText,
    }));
}
