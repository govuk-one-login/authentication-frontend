import StateMachineHelper, { State, Transition } from "./StateMachineHelper.js";
import {
  CONTACT_FORM_STRUCTURE,
  Theme,
} from "../../../src/components/contact-us/structure/contact-us-structure.js";
import i18next from "i18next";

export default class ContactFormStateMachineHelper extends StateMachineHelper {
  private readonly BASE_ID = "contact-us";
  private readonly SUBMIT_SUCCESS_ID = `${this.BASE_ID}-submit-success`;

  getReachableStatesAndTransitions(): {
    states: State[];
    transitions: Transition[];
  } {
    const states: State[] = [];
    const transitions: Transition[] = [];

    states.push({
      name: "Contact Us",
      id: this.BASE_ID,
    });

    states.push({
      name: "Submit Success",
      id: this.SUBMIT_SUCCESS_ID,
    });

    CONTACT_FORM_STRUCTURE.forEach((theme, themeKey) => {
      const themeId = `${this.BASE_ID}.${themeKey}`.replaceAll("_", "-");
      states.push({
        name: i18next.t(`${theme.nextPageContent}.title`),
        id: themeId,
      });
      transitions.push({
        source: this.BASE_ID,
        target: themeId,
      });

      if (theme.subThemes) {
        theme.subThemes.forEach((subTheme, subThemeKey) => {
          const subThemeId = `${themeId}.${subThemeKey}`.replaceAll("_", "-");
          states.push({
            name: i18next.t(`${subTheme.nextPageContent}.title`),
            id: subThemeId,
          });
          transitions.push({
            source: themeId,
            target: subThemeId,
          });
          transitions.push({
            source: subThemeId,
            target: this.SUBMIT_SUCCESS_ID,
          });
        });
      } else {
        transitions.push({
          source: themeId,
          target: this.SUBMIT_SUCCESS_ID,
        });
      }
    });

    return {
      states,
      transitions,
    };
  }

  getClickAction(state: State): (() => void) | undefined {
    return () => {
      const idParts = state.id.split(".");

      let path;
      if (idParts.length === 1) {
        switch (idParts[0]) {
          case this.BASE_ID:
            path = "/contact-us";
            break;
          case this.SUBMIT_SUCCESS_ID:
            path = "/contact-us-submit-success";
            break;
        }
      } else if (idParts.length === 2) {
        const themeKey = idParts[1].replaceAll("-", "_");
        const theme = CONTACT_FORM_STRUCTURE.get(themeKey) as Theme;
        if (theme.subThemes) {
          path = `/contact-us-further-information?theme=${themeKey}`;
        } else {
          path = `/contact-us-questions?theme=${themeKey}`;
        }
      } else if (idParts.length === 3) {
        const themeKey = idParts[1].replaceAll("-", "_");
        const subThemeKey = idParts[2].replaceAll("-", "_");
        path = `/contact-us-questions?theme=${themeKey}&subtheme=${subThemeKey}`;
      }

      window.open(path, "_blank");
    };
  }
}
