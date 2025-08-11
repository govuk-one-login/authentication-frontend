import { expect } from "chai";
import { describe } from "mocha";
import {
  getErrorMessageForAccountCreationIssueDescription,
  getErrorMessageForAdditionalDescription,
  getErrorMessageForFaceToFaceIssueDescription,
  getErrorMessageForIdCheckAppIssueDescription,
  getErrorMessageForIssueDescription,
  getErrorMessageForSigningInIssueDescription,
  getLengthExceededErrorMessageForAccountCreationIssueDescription,
  getLengthExceededErrorMessageForIdCheckAppIssueDescription,
  getLengthExceededErrorMessageForIssueDescription,
  getLengthExceededErrorMessageForSigningInIssueDescription,
} from "../validation/contact-us-questions-validation.js";
import { CONTACT_US_THEMES } from "src/app.constants.js";

interface TestCase {
  subtheme: string;
  expectedString: string;
}

const ERROR_MESSAGE_ISSUE_TEST_CASES: (TestCase & { theme: string })[] = [
  {
    theme: CONTACT_US_THEMES.SOMETHING_ELSE,
    subtheme: "",
    expectedString:
      "pages.contactUsQuestions.anotherProblem.section1.errorMessage",
  },
  {
    theme: CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK,
    subtheme: "",
    expectedString:
      "pages.contactUsQuestions.suggestionOrFeedback.section1.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_ADDRESS,
    expectedString:
      "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.whatHappened.errorMessage",
  },
  {
    theme: CONTACT_US_THEMES.PROVING_IDENTITY,
    subtheme: "",
    expectedString:
      "pages.contactUsQuestions.provingIdentity.section1.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.ACCOUNT_NOT_FOUND,
    expectedString:
      "pages.contactUsQuestions.accountNotFound.section1.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.technicalError.section1.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.authenticatorApp.section1.errorMessage",
  },
];

const ERROR_MESSAGE_FACE_TO_FACE_ISSUE_TEST_CASES: TestCase[] = [
  {
    subtheme:
      CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_ENTERING_DETAILS,
    expectedString:
      "pages.contactUsQuestions.provingIdentityFaceToFaceDetails.whatHappened.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_LETTER,
    expectedString:
      "pages.contactUsQuestions.provingIdentityFaceToFaceLetter.whatHappened.errorMessage",
  },
  {
    subtheme:
      CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_AT_POST_OFFICE,
    expectedString:
      "pages.contactUsQuestions.provingIdentityFaceToFacePostOffice.whatHappened.errorMessage",
  },
  {
    subtheme:
      CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_FINDING_RESULT,
    expectedString:
      "pages.contactUsQuestions.provingIdentityFaceToFaceIdResults.whatHappened.errorMessage",
  },
  {
    subtheme:
      CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_PROBLEM_CONTINUING,
    expectedString:
      "pages.contactUsQuestions.provingIdentityFaceToFaceService.whatHappened.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.provingIdentityFaceToFaceTechnicalProblem.section1.errorMessage",
  },
];

const ERROR_MESSAGE_ACCOUNT_CREATION_ISSUE_TEST_CASES: TestCase[] = [
  {
    subtheme: CONTACT_US_THEMES.SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.accountCreationProblem.section1.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.anotherProblem.section1.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE,
    expectedString:
      "pages.contactUsQuestions.signInPhoneNumberIssue.section1.errorMessage",
  },
];

const ERROR_MESSAGE_SIGNING_IN_ISSUE_TEST_CASES = [
  {
    subtheme: CONTACT_US_THEMES.SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.signignInProblem.section1.errorMessage",
  },
];

const ERROR_MESSAGE_ID_CHECK_APP_ISSUE_TEST_CASES: TestCase[] = [
  {
    subtheme: CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.idCheckAppTechnicalProblem.section1.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.govUKLoginAndIdAppsTechnicalProblem.section1.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.idCheckAppSomethingElse.section1.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.govUKLoginAndIdAppsSomethingElse.section1.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM,
    expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.LINKING_PROBLEM,
    expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.ID_CHECK_APP_LINKING_PROBLEM,
    expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.ONE_LOGIN_APP_SIGN_IN_PROBLEM,
    expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.FACE_SCANNING_PROBLEM,
    expectedString: "pages.contactUsQuestions.whatHappened.errorMessage",
  },
];

describe("get error message", () => {
  ERROR_MESSAGE_ISSUE_TEST_CASES.forEach(
    ({ theme, subtheme, expectedString }) => {
      it(`should return correct string for general error message given theme ${theme || "not defined"} and subtheme ${subtheme || "not defined"}`, () => {
        expect(getErrorMessageForIssueDescription(theme, subtheme)).to.eq(
          expectedString
        );
      });
    }
  );

  ERROR_MESSAGE_FACE_TO_FACE_ISSUE_TEST_CASES.forEach(
    ({ subtheme, expectedString }) => {
      it(`should return correct string for specific error csae 'faceToFaceIssue' given subtheme ${subtheme}`, () => {
        expect(getErrorMessageForFaceToFaceIssueDescription(subtheme)).to.eq(
          expectedString
        );
      });
    }
  );

  ERROR_MESSAGE_ACCOUNT_CREATION_ISSUE_TEST_CASES.forEach(
    ({ subtheme, expectedString }) => {
      it(`should return correct string for specific error case 'accountCreationIssue' given subtheme ${subtheme}`, () => {
        expect(
          getErrorMessageForAccountCreationIssueDescription(subtheme)
        ).to.eq(expectedString);
      });
    }
  );

  ERROR_MESSAGE_SIGNING_IN_ISSUE_TEST_CASES.forEach(
    ({ subtheme, expectedString }) => {
      it(`should return correct string for specific error case 'signingInIssue' given subtheme ${subtheme}`, () => {
        expect(getErrorMessageForSigningInIssueDescription(subtheme)).to.eq(
          expectedString
        );
      });
    }
  );

  ERROR_MESSAGE_ID_CHECK_APP_ISSUE_TEST_CASES.forEach(
    ({ subtheme, expectedString }) => {
      it(`should return correct string for specific error case 'idCheckAppIssue' given subtheme ${subtheme}`, () => {
        expect(getErrorMessageForIdCheckAppIssueDescription(subtheme)).to.eq(
          expectedString
        );
      });
    }
  );
});

const LENGTH_EXCEEDED_ISSUE_TEST_CASES: (TestCase & { theme: string })[] = [
  {
    theme: CONTACT_US_THEMES.SOMETHING_ELSE,
    subtheme: "",
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
  {
    theme: CONTACT_US_THEMES.PROVING_IDENTITY,
    subtheme: "",
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
  {
    theme: CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK,
    subtheme: "",
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.suggestionFeedbackTooLongMessage",
  },
];

const LENGTH_EXCEEDED_ACCOUNT_CREATION_ISSUE_TEST_CASES: TestCase[] = [
  {
    subtheme: CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.anythingElseTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
];

const LENGTH_EXCEEDED_ID_CHECK_APP_TEST_CASES: TestCase[] = [
  {
    subtheme: CONTACT_US_THEMES.LINKING_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.ID_CHECK_APP_LINKING_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.ONE_LOGIN_APP_SIGN_IN_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.TAKING_PHOTO_OF_ID_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.FACE_SCANNING_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.whatHappenedTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
];

const LENGTH_EXCEEDED_SIGNING_IN_ISSUE_TEST_CASES: TestCase[] = [
  {
    subtheme: CONTACT_US_THEMES.ACCOUNT_NOT_FOUND,
    expectedString:
      "pages.contactUsQuestions.accountNotFound.section1.entryTooLongErrorMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.entryTooLongMessage",
  },
  {
    subtheme: CONTACT_US_THEMES.SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.issueDescriptionErrorMessage.anythingElseTooLongMessage",
  },
];

describe("Length exceeded error message", () => {
  LENGTH_EXCEEDED_ISSUE_TEST_CASES.forEach(
    ({ theme, subtheme, expectedString }) => {
      it(`for account creation issue description given theme ${theme || "not defined"} and subtheme ${subtheme || "not defined"}`, () => {
        expect(
          getLengthExceededErrorMessageForIssueDescription(theme, subtheme)
        ).to.eq(expectedString);
      });
    }
  );

  LENGTH_EXCEEDED_ACCOUNT_CREATION_ISSUE_TEST_CASES.forEach(
    ({ subtheme, expectedString }) => {
      it(`for account creation issue description given subtheme ${subtheme}`, () => {
        expect(
          getLengthExceededErrorMessageForAccountCreationIssueDescription(
            subtheme
          )
        ).to.eq(expectedString);
      });
    }
  );

  LENGTH_EXCEEDED_ID_CHECK_APP_TEST_CASES.forEach(
    ({ subtheme, expectedString }) => {
      it(`for account creation issue description given subtheme ${subtheme}`, () => {
        expect(
          getLengthExceededErrorMessageForIdCheckAppIssueDescription(subtheme)
        ).to.eq(expectedString);
      });
    }
  );

  LENGTH_EXCEEDED_SIGNING_IN_ISSUE_TEST_CASES.forEach(
    ({ subtheme, expectedString }) => {
      it(`for account creation issue description given subtheme ${subtheme}`, () => {
        expect(
          getLengthExceededErrorMessageForSigningInIssueDescription(subtheme)
        ).to.eq(expectedString);
      });
    }
  );
});

const ERROR_MESSAGE_ADDITIONAL_DESCRIPTION_TEST_CASES: (TestCase & {
  theme: string;
})[] = [
  {
    theme: CONTACT_US_THEMES.SOMETHING_ELSE,
    subtheme: "",
    expectedString:
      "pages.contactUsQuestions.anotherProblem.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.PROVING_IDENTITY_PROBLEM_WITH_ADDRESS,
    expectedString:
      "pages.contactUsQuestions.provingIdentityProblemEnteringAddress.whatWereYouTryingToDo.errorMessage",
  },
  {
    theme: CONTACT_US_THEMES.PROVING_IDENTITY,
    subtheme: "",
    expectedString:
      "pages.contactUsQuestions.provingIdentity.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.technicalError.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.AUTHENTICATOR_APP_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.authenticatorApp.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.ID_CHECK_APP_TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.idCheckAppTechnicalProblem.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_TECHNICAL_ERROR,
    expectedString:
      "pages.contactUsQuestions.govUKLoginAndIdAppsTechnicalProblem.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.ID_CHECK_APP_SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.idCheckAppTechnicalProblem.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.GOV_UK_LOGIN_AND_ID_APPS_SOMETHING_ELSE,
    expectedString:
      "pages.contactUsQuestions.govUKLoginAndIdAppsTechnicalProblem.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_TECHNICAL_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.provingIdentityFaceToFaceTechnicalProblem.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE_ANOTHER_PROBLEM,
    expectedString:
      "pages.contactUsQuestions.provingIdentityFaceToFaceSomethingElse.section2.errorMessage",
  },
  {
    theme: "",
    subtheme: CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE,
    expectedString:
      "pages.contactUsQuestions.signInPhoneNumberIssue.section2.errorMessage",
  },
];

ERROR_MESSAGE_ADDITIONAL_DESCRIPTION_TEST_CASES.forEach(
  ({ theme, subtheme, expectedString }) => {
    it(`for account creation issue description given theme ${theme || "not defined"} and subtheme ${subtheme || "not defined"}`, () => {
      expect(getErrorMessageForAdditionalDescription(theme, subtheme)).to.eq(
        expectedString
      );
    });
  }
);
