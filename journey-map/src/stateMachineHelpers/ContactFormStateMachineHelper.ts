import StateMachineHelper from "./StateMachineHelper.js";
import { CONTACT_FORM_STRUCTURE } from "../../../src/components/contact-us/structure/contact-us-structure.js";
import i18next from "i18next";
import { CONTACT_US_THEMES, PATH_NAMES } from "../../../src/app.constants.js";
import { State, StateMachineConfig, Transition } from "../index.js";

const openPage = (path: string) => {
  return () => {
    window.open(path, "_blank");
  };
};

export default class ContactFormStateMachineHelper extends StateMachineHelper {
  getReachableStatesAndTransitions(): StateMachineConfig {
    const states: State[] = [];
    const transitions: Transition[] = [];

    states.push({
      name: "Contact Us",
      id: PATH_NAMES.CONTACT_US,
      onClick: openPage(PATH_NAMES.CONTACT_US),
    });

    states.push({
      name: "Contact Us - Gov Service",
      id: `${PATH_NAMES.CONTACT_US}?supportType=GOV_SERVICE`,
      onClick: openPage(`${PATH_NAMES.CONTACT_US}?supportType=GOV_SERVICE`),
    });

    states.push({
      name: "Contact Us - Triage",
      id: PATH_NAMES.CONTACT_US_FROM_TRIAGE_PAGE,
    });
    transitions.push({
      source: PATH_NAMES.CONTACT_US_FROM_TRIAGE_PAGE,
      target: PATH_NAMES.CONTACT_US,
    });
    transitions.push({
      source: PATH_NAMES.CONTACT_US_FROM_TRIAGE_PAGE,
      target: `${PATH_NAMES.CONTACT_US}.${CONTACT_US_THEMES.ID_CHECK_APP}`,
      condition: "theme is id_check_app",
    });

    states.push({
      name: "Submit Success",
      id: PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS,
      onClick: openPage(PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS),
    });

    CONTACT_FORM_STRUCTURE.forEach((theme, themeKey) => {
      const themeId = `${PATH_NAMES.CONTACT_US}.${themeKey}`;
      transitions.push({
        source: PATH_NAMES.CONTACT_US,
        target: themeId,
      });

      if (theme.subThemes) {
        states.push({
          name: i18next.t(`${theme.nextPageContent}.title`),
          id: themeId,
          onClick: openPage(
            `${PATH_NAMES.CONTACT_US_FURTHER_INFORMATION}?theme=${themeKey}`
          ),
        });

        theme.subThemes.forEach((subTheme, subThemeKey) => {
          const subThemeId = `${themeId}.${subThemeKey}`;
          states.push({
            name: i18next.t(`${subTheme.nextPageContent}.title`),
            id: subThemeId,
            onClick: openPage(
              `${PATH_NAMES.CONTACT_US_QUESTIONS}?theme=${themeKey}&subtheme=${subThemeKey}`
            ),
          });
          transitions.push({
            source: themeId,
            target: subThemeId,
          });
          transitions.push({
            source: subThemeId,
            target: PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS,
          });
        });
      } else {
        states.push({
          name: i18next.t(`${theme.nextPageContent}.title`),
          id: themeId,
          onClick: openPage(
            `${PATH_NAMES.CONTACT_US_QUESTIONS}?theme=${themeKey}`
          ),
        });

        transitions.push({
          source: themeId,
          target: PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS,
        });
      }
    });

    return {
      states,
      transitions,
    };
  }
}
