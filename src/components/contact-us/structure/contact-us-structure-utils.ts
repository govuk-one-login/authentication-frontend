import type { Theme } from "./contact-us-structure.js";
import type { TemplateThemeRadioButtons } from "../types.js";

export function getThemeRadioButtonsFromStructure(
  structure: Map<string, Theme>
): TemplateThemeRadioButtons[] {
  return Array.from(structure)
    .filter(([, theme]) => !theme.isHidden)
    .map(([themeName, theme]) => ({
      value: themeName,
      mainTextKey: theme.radio.mainTextKey,
      hintTextKey: theme.radio.hintTextKey,
    }));
}

export function getTitleKeyFromTheme(theme: Theme): string {
  return `${theme.nextPageContent}.title`;
}

export function getHeaderKeyFromTheme(theme: Theme): string {
  return `${theme.nextPageContent}.header`;
}

export function getLegendKeyFromTheme(theme: Theme): string {
  return `${theme.nextPageContent}.section1.header`;
}
