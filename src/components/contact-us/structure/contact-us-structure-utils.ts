import type { Theme } from "./contact-us-structure.js";

interface ThemeRadioButtons {
  value: string;
  text: string;
}

export function getThemeRadioButtonsFromStructure(structure: Map<string, Theme>): ThemeRadioButtons[] {
  return Array.from(structure).map(([themeName, theme]) => ({
    value: themeName,
    text: theme.radio.mainText,
  }));
}
