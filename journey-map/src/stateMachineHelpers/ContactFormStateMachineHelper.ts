import StateMachineHelper, { State, Transition } from "./StateMachineHelper.js";
import {
  CONTACT_FORM_STRUCTURE,
  Theme,
} from "../../../src/components/contact-us/structure/contact-us-structure.js";
import i18next from "i18next";
import { CONTACT_US_THEMES } from "../../../src/app.constants.js";

export default class ContactFormStateMachineHelper extends StateMachineHelper {
  private readonly CONTACT_US_ID = "contact-us";
  private readonly CONTACT_US_GOV_SERVICE_ID = `${this.CONTACT_US_ID}-gov-service`;
  private readonly CONTACT_US_TRIAGE_ID = `${this.CONTACT_US_ID}-triage`;
  private readonly CONTACT_US_SUBMIT_SUCCESS_ID = `${this.CONTACT_US_ID}-submit-success`;

  getReachableStatesAndTransitions(): {
    states: State[];
    transitions: Transition[];
  } {
    const states: State[] = [];
    const transitions: Transition[] = [];

    states.push({
      name: "Contact Us",
      id: this.CONTACT_US_ID,
    });

    states.push({
      name: "Contact Us - Gov Service",
      id: this.CONTACT_US_GOV_SERVICE_ID,
    });

    states.push({
      name: "Contact Us - Triage",
      id: this.CONTACT_US_TRIAGE_ID,
    });
    transitions.push({
      source: this.CONTACT_US_TRIAGE_ID,
      target: this.CONTACT_US_ID,
    });
    transitions.push({
      source: this.CONTACT_US_TRIAGE_ID,
      target: `${this.CONTACT_US_ID}.${CONTACT_US_THEMES.ID_CHECK_APP}`,
      condition: "theme is id_check_app",
    });

    states.push({
      name: "Submit Success",
      id: this.CONTACT_US_SUBMIT_SUCCESS_ID,
    });

    CONTACT_FORM_STRUCTURE.forEach((theme, themeKey) => {
      const themeId = `${this.CONTACT_US_ID}.${themeKey}`;
      states.push({
        name: i18next.t(`${theme.nextPageContent}.title`),
        id: themeId,
      });
      transitions.push({
        source: this.CONTACT_US_ID,
        target: themeId,
      });

      if (theme.subThemes) {
        theme.subThemes.forEach((subTheme, subThemeKey) => {
          const subThemeId = `${themeId}.${subThemeKey}`;
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
            target: this.CONTACT_US_SUBMIT_SUCCESS_ID,
          });
        });
      } else {
        transitions.push({
          source: themeId,
          target: this.CONTACT_US_SUBMIT_SUCCESS_ID,
        });
      }
    });

    return {
      states,
      transitions,
    };
  }

  getClickAction(state: State): (() => void) | undefined {
    if (state.id === this.CONTACT_US_TRIAGE_ID) {
      return undefined;
    }

    return () => {
      const idParts = state.id.split(".");

      let path = "/";
      if (idParts.length === 1) {
        if (idParts[0] === this.CONTACT_US_ID) {
          path = "/contact-us";
        } else if (idParts[0] === this.CONTACT_US_GOV_SERVICE_ID) {
          path = "/contact-us?supportType=GOV_SERVICE";
        } else if (idParts[0] === this.CONTACT_US_SUBMIT_SUCCESS_ID) {
          path = "/contact-us-submit-success";
        }
      } else if (idParts.length === 2) {
        const themeKey = idParts[1];
        const theme = CONTACT_FORM_STRUCTURE.get(themeKey) as Theme;
        if (theme.subThemes) {
          path = `/contact-us-further-information?theme=${themeKey}`;
        } else {
          path = `/contact-us-questions?theme=${themeKey}`;
        }
      } else if (idParts.length === 3) {
        const themeKey = idParts[1];
        const subThemeKey = idParts[2];
        path = `/contact-us-questions?theme=${themeKey}&subtheme=${subThemeKey}`;
      }

      window.open(path, "_blank");
    };
  }
}
