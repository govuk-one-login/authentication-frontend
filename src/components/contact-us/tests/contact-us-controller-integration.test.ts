import { describe } from "mocha";
import { expect, sinon, request } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { PATH_NAMES, CONTACT_US_THEMES } from "../../../app.constants";

describe("Integration:: contact us - public user", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let smartAgentApiUrl: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user.email = "test@test.com";
        req.session.user.phoneNumber = "7867";

        next();
      });

    app = await require("../../../app").createApp();
    smartAgentApiUrl = process.env.SMARTAGENT_API_URL;

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
        .query("theme=email_subscriptions")
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
