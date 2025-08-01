import type { Theme } from "./contact-us-structure.js";
import type { ThemeRadioButtons } from "../types.js";

export function getThemeRadioButtonsFromStructure(structure: Map<string, Theme>): ThemeRadioButtons[] {
  return Array.from(structure).map(([themeName, theme]) => ({
    value: themeName,
    text: theme.radio.mainText,
  }));
}
