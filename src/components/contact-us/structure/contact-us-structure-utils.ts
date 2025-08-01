import type { Theme } from "./contact-us-structure.js";
import type { ThemeRadioButtons } from "../types.js";

export function getThemeRadioButtonsFromStructure(structure: Map<string, Theme>): ThemeRadioButtons[] {
  return Array.from(structure).map(([themeName, theme]) => ({
    value: themeName,
    text: theme.radio.mainText,
  }));
}

export function getTitleFromTheme(theme: Theme): string {
  return `${theme.nextPageContent}.title`
}

export function getHeaderFromTheme(theme: Theme): string {
  return `${theme.nextPageContent}.header`
}

export function getLegendFromTheme(theme: Theme): string {
  return `${theme.nextPageContent}.section1.header`
}