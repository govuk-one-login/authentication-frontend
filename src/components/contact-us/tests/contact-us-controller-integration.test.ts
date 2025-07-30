import { describe } from "mocha";
import { expect, sinon, request } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import * as cheerio from "cheerio";
import { PATH_NAMES, CONTACT_US_THEMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import esmock from "esmock";

describe("Integration:: contact us - public user", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let smartAgentApiUrl: string;

  before(async () => {
    const { createApp } = await esmock(
      "../../../app.js",
      {},
      {
        "../../../middleware/session-middleware.js": {
          validateSessionMiddleware: sinon.fake(function (
            req: Request,
            res: Response,
            next: NextFunction
          ): void {
            res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
            req.session.user.email = "test@test.com";
            req.session.user.mfaMethods = buildMfaMethods({
              phoneNumber: "7867",
            });

            next();
          }),
        },
      }
    );

    app = await createApp();
    smartAgentApiUrl = "http://smartagentmockurl";

    await request(
      app,
      (test) => test.get(PATH_NAMES.CONTACT_US).query("supportType=PUBLIC"),
      { expectAnalyticsPropertiesMatchSnapshot: false }
    ).then((res) => {
      const $ = cheerio.load(res.text);
      token = $("[name=_csrf]").val();
      cookies = res.headers["set-cookie"];
    });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  const expectValidationErrorOnPost = async (
    url: string,
    data: Record<string, unknown>,
    errorElement: string,
    errorDescription: string
  ) => {
    await request(app, (test) =>
      test
        .post(url)
        .type("form")
        .set("Cookie", cookies)
        .send(data)
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($(errorElement).text()).to.contains(errorDescription);
        })
        .expect(400)
    );
  };

  it("should return contact us page", async () => {
    await request(app, (test) =>
      test.get(PATH_NAMES.CONTACT_US).query("supportType=PUBLIC").expect(200)
    );
  });

  [
    "test123",
    "accountCreatedEmail123",
    "http://remotehost/something",
    "<script>alert(123);</script>",
  ].forEach(function (referer) {
    it("should return contact us page removing invalid referer url", async () => {
      await request(app, (test) =>
        test
          .get(PATH_NAMES.CONTACT_US)
          .query("supportType=PUBLIC")
          .set("referer", referer)
          .expect(function (res) {
            const $ = cheerio.load(res.text);
            expect($("input[name = referer]").val()).to.not.contains(referer);
            expect($("input[name = referer]").val()).to.not.contains(
              encodeURIComponent(referer)
            );
          })
          .expect(200)
      );
    });
  });

  [
    "",
    "accountCreatedEmail",
    "emailAddressUpdatedEmail",
    "http://localhost:8080/startpage",
    "http://localhost/anypage",
    "https://localhost/scenario/page",
  ].forEach(function (referer) {
    it("should return contact us page including valid referer url", async () => {
      await request(app, (test) =>
        test
          .get(PATH_NAMES.CONTACT_US)
          .query("supportType=PUBLIC")
          .set("referer", referer)
          .expect(function (res) {
            const $ = cheerio.load(res.text);
            expect($("input[name = referer]").val()).to.contains(
              encodeURIComponent(referer)
            );
          })
          .expect(200)
      );
    });
  });

  [
    "test123",
    "http://remotehost/something",
    "<script>alert(123);</script>",
  ].forEach(function (referer) {
    it("should return contact us questions page removing invalid referer queryparam url", async () => {
      await request(app, (test) =>
        test
          .get(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION)
          .query("theme=account_creation")
          .query("subtheme=sign_in_phone_number_issue")
          .query("referer=" + referer)
          .expect(function (res) {
            const $ = cheerio.load(res.text);
            expect($("input[name = referer]").val()).to.not.contains(referer);
            expect($("input[name = referer]").val()).to.not.contains(
              encodeURIComponent(referer)
            );
          })
          .expect(200)
      );
    });
  });

  [
    "",
    "accountCreatedEmail",
    "emailAddressUpdatedEmail",
    "http://localhost:8080/startpage",
    "http://localhost/anypage",
    "http://localhost:3000/enter-email",
  ].forEach(function (referer) {
    it("should return contact us questions page including valid referer queryparam url", async () => {
      await request(app, (test) =>
        test
          .get(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION)
          .query("theme=account_creation")
          .query("referer=" + referer)
          .expect(function (res) {
            const $ = cheerio.load(res.text);
            expect($("input[name = referer]").val()).to.contains(
              encodeURIComponent(referer)
            );
          })
          .expect(200)
      );
    });
  });

  it("should return contact us further information signing in page", async () => {
    await request(app, (test) =>
      test
        .get("/contact-us-further-information")
        .query("theme=signing_in")
        .expect(200)
    );
  });

  it("should return contact us further information account creation page", async () => {
    await request(app, (test) =>
      test
        .get("/contact-us-further-information")
        .query("theme=account_creation")
        .expect(200)
    );
  });

  it("should return contact us questions page with only a theme", async () => {
    await request(app, (test) =>
      test
        .get("/contact-us-questions")
        .query("theme=something_else")
        .expect(200)
    );
  });

  it("should return contact us questions page with a theme and a subtheme", async () => {
    await request(app, (test) =>
      test
        .get("/contact-us-questions")
        .query("theme=signing_in")
        .query("subtheme=no_security_code")
        .expect(200)
    );
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CONTACT_US)
        .query("supportType=PUBLIC")
        .type("form")
        .send({})
        .expect(403)
    );
  });

  it("should return validation error when no radio boxes are selected on the signing in contact-us-further-information page", async () => {
    const data = {
      _csrf: token,
      theme: "signing_in",
    };
    await expectValidationErrorOnPost(
      "/contact-us-further-information",
      data,
      "#subtheme-error",
      "Select the problem you had when signing in to your GOV.UK One Login"
    );
  });

  it("should return validation error when no radio boxes are selected on the proving_identity contact-us-further-information page", async () => {
    const data = {
      _csrf: token,
      theme: "proving_identity",
    };
    await expectValidationErrorOnPost(
      "/contact-us-further-information",
      data,
      "#subtheme-error",
      "Select the problem you had proving your identity"
    );
  });

  describe("visiting contact-us-questions directly", () => {
    it("should return validation error when issue description are not entered on the contact-us-questions page", async () => {
      const data = {
        _csrf: token,
        issueDescription: "",
        theme: "signing_in",
        subtheme: "technical_error",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#issueDescription-error",
        "Enter what you were trying to do"
      );
    });

    it("should return validation error when user selected yes to contact for feedback and left email field empty", async () => {
      const data = {
        _csrf: token,
        theme: "signing_in",
        subtheme: "something_else",
        issueDescription: "issue",
        additionalDescription: "additional",
        contact: "true",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#email-error",
        "Enter your email address"
      );
    });

    it("should return validation error when user selected Text message to a phone number from another country and left the Which country field empty", async () => {
      await request(app, (test) =>
        test
          .post("/contact-us-questions?radio_buttons=true")
          .type("form")
          .set("Cookie", cookies)
          .send({
            _csrf: token,
            theme: "account_creation",
            subtheme: "invalid_security_code",
            additionalDescription: "additional",
            contact: "false",
            securityCodeSentMethod: "text_message_international_number",
            country: " ",
          })
          .expect(function (res) {
            const $ = cheerio.load(res.text);
            expect($("#country-error").text()).to.contains(
              "Enter which country your phone number is from"
            );
          })
          .expect(400)
      );
    });

    it("should return validation error when user selected yes to contact for feedback but email is in an invalid format", async () => {
      const data = {
        _csrf: token,
        theme: "signing_in",
        subtheme: "something_else",
        issueDescription: "issue",
        additionalDescription: "additional",
        contact: "true",
        email: "test",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#email-error",
        "Enter an email address in the correct format, like name@example.com"
      );
    });

    it("should return validation error when user has not selected how the security code was sent whilst creating an account", async () => {
      const data = {
        _csrf: token,
        theme: "account_creation",
        subtheme: "no_security_code",
        moreDetailDescription: "issue",
        formType: "noSecurityCode",
        contact: "false",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions?radio_buttons=true",
        data,
        "#securityCodeSentMethod-error",
        "Select whether you expected to get the code by email, text message or authenticator app"
      );
    });

    describe("somebody else is using your information", () => {
      it("should return validation error when user hasn't selected any reasons", async () => {
        const data = {
          _csrf: token,
          theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
          email: "test@example.com",
        };
        await expectValidationErrorOnPost(
          "/contact-us-questions",
          data,
          "#suspectUnauthorisedAccessReasons-error",
          "Select at least one option"
        );
      });

      it("should return validation error when email is empty", async () => {
        const data = {
          _csrf: token,
          theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
          suspectUnauthorisedAccessReasons:
            "hasReceivedUnwarrantedSecurityCode",
        };
        await expectValidationErrorOnPost(
          "/contact-us-questions",
          data,
          "#email-error",
          "Enter the email address of your GOV.UK One Login"
        );
      });

      it("should return validation error when email address is invalid", async () => {
        const data = {
          _csrf: token,
          theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
          suspectUnauthorisedAccessReasons:
            "hasReceivedUnwarrantedSecurityCode",
          email: "test",
        };
        await expectValidationErrorOnPost(
          "/contact-us-questions",
          data,
          "#email-error",
          "Enter an email address in the correct format, like name@example.com"
        );
      });

      describe("phone number validation", () => {
        describe("hasInternationalPhoneNumber validation", () => {
          it("should run uk phone number validation when not hasInternationalPhoneNumber", () => {});

          it("should run international phone number validation when  hasInternationalPhoneNumber", () => {});
        });

        describe("uk phone number", () => {
          it("should return validation error when not using numbers", async () => {
            const data = {
              _csrf: token,
              theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
              suspectUnauthorisedAccessReasons:
                "hasReceivedUnwarrantedSecurityCode",
              email: "test@example.com",
              phoneNumber: "abc",
            };
            await expectValidationErrorOnPost(
              "/contact-us-questions",
              data,
              "#phoneNumber-error",
              "Enter a UK mobile phone number using only numbers or the + symbol"
            );
          });

          it("should return validation error when wrong length", async () => {
            const data = {
              _csrf: token,
              theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
              suspectUnauthorisedAccessReasons:
                "hasReceivedUnwarrantedSecurityCode",
              email: "test@example.com",
              phoneNumber: "12345",
            };
            await expectValidationErrorOnPost(
              "/contact-us-questions",
              data,
              "#phoneNumber-error",
              "Enter a UK mobile phone number, like 07700 900000"
            );
          });

          it("should return validation error when non-uk number", async () => {
            const data = {
              _csrf: token,
              theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
              suspectUnauthorisedAccessReasons:
                "hasReceivedUnwarrantedSecurityCode",
              email: "test@example.com",
              phoneNumber: "12345",
            };
            await expectValidationErrorOnPost(
              "/contact-us-questions",
              data,
              "#phoneNumber-error",
              "Enter a UK mobile phone number"
            );
          });
        });

        describe("international phone number", () => {
          it("should return validation error when not using numbers", async () => {
            const data = {
              _csrf: token,
              theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
              suspectUnauthorisedAccessReasons:
                "hasReceivedUnwarrantedSecurityCode",
              email: "test@example.com",
              hasInternationalPhoneNumber: "true",
              internationalPhoneNumber: "abc",
            };
            await expectValidationErrorOnPost(
              "/contact-us-questions",
              data,
              "#internationalPhoneNumber-error",
              "Enter a mobile phone number using only numbers or the + symbol"
            );
          });

          it("should return validation error when wrong length", async () => {
            const data = {
              _csrf: token,
              theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
              suspectUnauthorisedAccessReasons:
                "hasReceivedUnwarrantedSecurityCode",
              email: "test@example.com",
              hasInternationalPhoneNumber: "true",
              internationalPhoneNumber: "+123456789012345678901234567890",
            };
            await expectValidationErrorOnPost(
              "/contact-us-questions",
              data,
              "#internationalPhoneNumber-error",
              "Enter a mobile phone number in the correct format, including the country code"
            );
          });

          it("should return validation error when invalid number", async () => {
            const data = {
              _csrf: token,
              theme: CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS,
              suspectUnauthorisedAccessReasons:
                "hasReceivedUnwarrantedSecurityCode",
              email: "test@example.com",
              hasInternationalPhoneNumber: "true",
              internationalPhoneNumber: "+100000000000000000000000",
            };
            await expectValidationErrorOnPost(
              "/contact-us-questions",
              data,
              "#internationalPhoneNumber-error",
              "Enter a mobile phone number in the correct format, including the country code"
            );
          });
        });
      });
    });
  });

  describe("when a user had a problem with their identity document", () => {
    it("should return validation error when user has not selected which identity document they were using", async () => {
      const data = {
        _csrf: token,
        theme: "proving_identity",
        subtheme: "proving_identity_problem_with_identity_document",
        contact: "false",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#identityDocumentUsed-error",
        "Select which identity document you were using"
      );
    });
  });

  describe("when a user has not stated their location", () => {
    it("should return validation error when they submit the 'Another problem proving your identity' form", async () => {
      const data = {
        _csrf: token,
        theme: "proving_identity",
        subtheme: "proving_identity_something_else",
        contact: "false",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#location-error",
        "Select yes if you live in the UK, Channel Islands or Isle of Man"
      );
    });

    it("should return validation error when they submit the 'A problem entering your address' form", async () => {
      const data = {
        _csrf: token,
        theme: "proving_identity",
        subtheme: "proving_identity_problem_with_address",
        contact: "false",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#location-error",
        "Select yes if you live in the UK, Channel Islands or Isle of Man"
      );
    });
  });

  describe("when a user had a problem with their bank or building society details", () => {
    it("should return validation error when user has not selected which problem they had", async () => {
      const data = {
        _csrf: token,
        theme: "proving_identity",
        subtheme: "proving_identity_problem_with_bank_building_society_details",
        contact: "false",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#problemWith-error",
        "Select which problem you were having with your bank or building society details"
      );
    });
  });

  describe("when a user had a problem taking a photo of your identity document using the GOV.UK ID Check app", () => {
    it("should return validation error when user has not selected which identity document they were using", async () => {
      const data = {
        _csrf: token,
        theme: "id_check_app",
        subtheme: "taking_photo_of_id_problem",
        moreDetailDescription: "There was a problem",
        contact: "false",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions?radio_buttons=true",
        data,
        "#identityDocumentUsed-error",
        "Select which identity document you were using"
      );
    });
  });

  describe("when a user had a problem with their national insurance number", () => {
    it("should return validation error when user has not described which problem they had", async () => {
      const data = {
        _csrf: token,
        theme: "proving_identity",
        subtheme: "proving_identity_problem_with_national_insurance_number",
        contact: "false",
      };
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#problemWithNationalInsuranceNumber-error",
        "What problem were you having with your National Insurance number?"
      );
    });
  });

  describe("when a user had a problem with their phone number when creating an account", () => {
    const phoneNumberIssueData = (
      issueDescription: string,
      additionalDescription: string,
      countryPhoneNumberFrom: string
    ) => {
      return {
        _csrf: token,
        theme: "account_creation",
        subtheme: "sign_in_phone_number_issue",
        issueDescription: issueDescription,
        additionalDescription: additionalDescription,
        countryPhoneNumberFrom: countryPhoneNumberFrom,
        contact: "false",
        formType: "signInPhoneNumberIssue",
        referer: "https://gov.uk/sign-in",
      };
    };

    it("should return validation error when user has not entered what they were trying to do", async () => {
      const data = phoneNumberIssueData("", "additional detail", "UK");
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#issueDescription-error",
        "Enter what you were trying to do"
      );
    });

    it("should return validation error when user has not entered what happened", async () => {
      const data = phoneNumberIssueData("more detail", "", "UK");
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#additionalDescription-error",
        "Enter what happened"
      );
    });

    it("should return validation error when user has not entered country the phone number is from", async () => {
      const data = phoneNumberIssueData("more detail", "additional detail", "");
      await expectValidationErrorOnPost(
        "/contact-us-questions",
        data,
        "#countryPhoneNumberFrom-error",
        "Enter which country your phone number is from"
      );
    });

    it("should redirect to success page when valid form submitted", async () => {
      nock(smartAgentApiUrl).post("/").once().reply(200);

      await request(app, (test) =>
        test
          .post("/contact-us-questions")
          .type("form")
          .set("Cookie", cookies)
          .send(phoneNumberIssueData("detail", "description", "UK"))
          .expect("Location", PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS)
          .expect(302)
      );
    });
  });

  it("should redirect to success page when form submitted", async () => {
    nock(smartAgentApiUrl).post("/").once().reply(200);

    await request(app, (test) =>
      test
        .post("/contact-us-questions")
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          theme: "signing_in",
          subtheme: "no_security_code",
          optionalDescription: "issue",
          contact: "true",
          email: "test@test.com",
          formType: "noSecurityCode",
          referer: "https://gov.uk/sign-in",
        })
        .expect("Location", PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS)
        .expect(302)
    );
  });

  it("should redirect to success page when authenticator app problem form submitted", async () => {
    nock(smartAgentApiUrl).post("/").once().reply(200);

    await request(app, (test) =>
      test
        .post("/contact-us-questions")
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          theme: "account_creation",
          subtheme: "authenticator_app_problem",
          issueDescription: "issue",
          additionalDescription: "additional information",
          contact: "true",
          email: "test@test.com",
          formType: "authenticatorApp",
          referer: "https://gov.uk/sign-in",
        })
        .expect("Location", PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS)
        .expect(302)
    );
  });

  describe("Links to /contact-us-from-triage-page", () => {
    it("should redirect to /contact-us", async () => {
      await request(app, (test) =>
        test
          .get("/contact-us-from-triage-page")
          .query("fromURL=http//localhost/sign-in-or-create")
          .expect("Location", `${PATH_NAMES.CONTACT_US}?`)
          .expect(302)
      );
    });

    it("should redirect to /contact-us-further-information", async () => {
      await request(app, (test) =>
        test
          .get("/contact-us-from-triage-page")
          .query(`theme=${CONTACT_US_THEMES.ID_CHECK_APP}`)
          .expect(
            "Location",
            `${PATH_NAMES.CONTACT_US_FURTHER_INFORMATION}?theme=${CONTACT_US_THEMES.ID_CHECK_APP}`
          )
          .expect(302)
      );
    });
  });
});
