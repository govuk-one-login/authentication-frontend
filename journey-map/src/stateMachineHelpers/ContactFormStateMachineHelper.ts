import StateMachineHelper, { State, Transition } from "./StateMachineHelper.js";
import {
  CONTACT_FORM_STRUCTURE,
  Theme,
} from "../../../src/components/contact-us/structure/contact-us-structure.js";
import i18next from "i18next";

export default class ContactFormStateMachineHelper extends StateMachineHelper {
  getReachableStatesAndTransitions(): {
    states: State[];
    transitions: Transition[];
  } {
    const states: State[] = [];
    const transitions: Transition[] = [];

    const baseId = "contact-us";

    states.push({
      name: "Contact Us",
      id: baseId,
    });

    CONTACT_FORM_STRUCTURE.forEach((theme, themeKey) => {
      const themeId = `${baseId}.${themeKey}`.replaceAll("_", "-");
      states.push({
        name: i18next.t(`${theme.nextPageContent}.title`),
        id: themeId,
      });
      transitions.push({
        source: baseId,
        target: themeId,
      });

      theme.subThemes?.forEach((subTheme, subThemeKey) => {
        const subThemeId = `${themeId}.${subThemeKey}`.replaceAll("_", "-");
        states.push({
          name: i18next.t(`${subTheme.nextPageContent}.title`),
          id: subThemeId,
        });
        transitions.push({
          source: themeId,
          target: subThemeId,
        });
      });
    });

    return {
      states,
      transitions,
    };
  }

  getClickAction(state: State): (() => void) | undefined {
    return () => {
      const pathParts = state.id.split(".");

      let path;
      if (pathParts.length === 1) {
        path = "/contact-us";
      } else if (pathParts.length === 2) {
        const themeKey = pathParts[1].replaceAll("-", "_");
        const theme = CONTACT_FORM_STRUCTURE.get(themeKey) as Theme;
        if (theme.subThemes) {
          path = `/contact-us-further-information?theme=${themeKey}`;
        } else {
          path = `/contact-us-questions?theme=${themeKey}`;
        }
      } else if (pathParts.length === 3) {
        const themeKey = pathParts[1].replaceAll("-", "_");
        const subThemeKey = pathParts[2].replaceAll("-", "_");
        path = `/contact-us-questions?theme=${themeKey}&subtheme=${subThemeKey}`;
      }

      window.open(path, "_blank");
    };
  }
}
