import { expect } from "chai";
import { getErrorMessageForIdCheckAppIssueDescription } from "../contact-us-questions-validation.ts";
import { CONTACT_US_THEMES } from "../../../app.constants";

const idCheckAppIssueTestCases: { subTheme: string; expectedString: string }[] =
  [
    {
      subTheme: CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR,
      expectedString:
        "pages.contactUsQuestions.idCheckAppTechnicalProblem.section1.errorMessage",
    },
    {
      subTheme: CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR,
      expectedString:
        "pages.contactUsQuestions.govUKLoginAndIdAppsTechnicalProblem.section1.errorMessage",
    },
    {
      subTheme: CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE,
      expectedString:
        "pages.contactUsQuestions.idCheckAppSomethingElse.section1.errorMessage",
    },
    {
      subTheme: CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE,
      expectedString:
        "pages.contactUsQuestions.govUKLoginAndIdAppsSomethingElse.section1.errorMessage",
    },
    {
      subTheme: CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM,
      expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
    },
    {
      subTheme: CONTACT_US_THEMES.LINKING_PROBLEM,
      expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
    },
    {
      subTheme: CONTACT_US_THEMES.ID_CHECK_APP_LINKING_PROBLEM,
      expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
    },
    {
      subTheme: CONTACT_US_THEMES.ONE_LOGIN_APP_SIGN_IN_PROBLEM,
      expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
    },
    {
      subTheme: CONTACT_US_THEMES.FACE_SCANNING_PROBLEM,
      expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
    },
  ];
idCheckAppIssueTestCases.forEach(({ subTheme, expectedString }) => {
  it(`should return correct string 'idCheckAppIssue' given subtheme ${subTheme}`, () => {
    expect(getErrorMessageForIdCheckAppIssueDescription(subTheme)).to.eq(
      expectedString
    );
  });
});
