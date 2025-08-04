import type { Theme } from "./contact-us-structure.js";
import type { ThemeRadioButtons } from "../types.js";

export function getThemeRadioButtonsFromStructure(
  structure: Map<string, Theme>
): ThemeRadioButtons[] {
  return Array.from(structure)
    .filter(([, theme]) => !theme.isHidden)
    .map(([themeName, theme]) => ({
      value: themeName,
      mainText: theme.radio.mainText,
      hintText: theme.radio.hintText,
    }));
}

export function getTitleFromTheme(theme: Theme): string {
  return `${theme.nextPageContent}.title`;
}

export function getHeaderFromTheme(theme: Theme): string {
  return `${theme.nextPageContent}.header`;
}

export function getLegendFromTheme(theme: Theme): string {
  return `${theme.nextPageContent}.section1.header`;
}
