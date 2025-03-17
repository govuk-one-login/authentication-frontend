import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  contactUsFormPost,
  contactUsGet,
  contactUsGetFromTriagePage,
  contactUsQuestionsFormPostToSmartAgent,
  createTicketIdentifier,
  getAppErrorCode,
  getAppSessionId,
  getNextUrlBasedOnTheme,
  getPreferredLanguage,
  isAppJourney,
  prepareBackLink,
  validateAppErrorCode,
  validateAppId,
  validateReferer,
} from "../contact-us-controller";
import {
  CONTACT_US_REFERER_ALLOWLIST,
  CONTACT_US_THEMES,
  PATH_NAMES,
  SUPPORT_TYPE,
} from "../../../app.constants";
import { ExpressRouteFunc, RequestGet, ResponseRedirect } from "../../../types";
import { getServiceDomain, getSupportLinkUrl } from "../../../config";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper";
import { mockResponse } from "mock-req-res";
import { ContactForm } from "../types";

describe("contact us controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const REFERER = "http://localhost:3000/enter-email";

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      path: PATH_NAMES.CONTACT_US,
      body: {},
      query: {},
      headers: {},
      get: sandbox.fake() as unknown as RequestGet,
    };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake() as unknown as ResponseRedirect,
      locals: {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("contactUsGet", () => {
    it("should render contact us gov page if gov radio option was chosen", () => {
      req.query.supportType = SUPPORT_TYPE.GOV_SERVICE;
      contactUsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/index-gov-service-contact-us.njk"
      );
    });

    it("should render contact us public page if public radio option was chosen", () => {
      req.query.supportType = SUPPORT_TYPE.PUBLIC;
      contactUsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/index-public-contact-us.njk"
      );
    });

    it("should render contact us gov page with no hidden inputs passed in", () => {
      req.query.referer = "";
      req.query.fromURL = "";

      contactUsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/index-public-contact-us.njk",
        {
          referer: "",
          fromURL: undefined,
          hrefBack: PATH_NAMES.CONTACT_US,
        }
      );
    });

    it("should render contact us gov page with hidden inputs passed in", () => {
      req.query.referer = REFERER;
      const FROM_URL = "http://localhost/enter-email";
      req.query.fromURL = FROM_URL;
      const fromUrlEncoded = encodeURIComponent(FROM_URL);

      contactUsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/index-public-contact-us.njk",
        {
          referer: encodeURIComponent(REFERER),
          fromURL: fromUrlEncoded,
          hrefBack: `${PATH_NAMES.CONTACT_US}?fromURL=${fromUrlEncoded}`,
        }
      );
    });

    it("should render contact us gov page with null referer with injection", () => {
      const serviceDomain = "account.gov.uk";
      const scriptReferers = [
        "accountCreatedEmail<script>alert()</script>/" + serviceDomain,
        "accountCreatedEmail&lt;script&gt;alert()&lt;/script&gt;/" +
          serviceDomain,
        "accountCreatedEmail\u003Cscript\u003Ealert()\u003C/script\u003E/" +
          serviceDomain,
      ];
      scriptReferers.forEach((referer) => {
        req.query.referer = referer;

        contactUsGet(req as Request, res as Response);

        expect(res.render).to.have.calledWith(
          "contact-us/index-public-contact-us.njk",
          {
            referer: "",
            fromURL: undefined,
            hrefBack: PATH_NAMES.CONTACT_US,
          }
        );
      });
    });
  });

  describe("contactUsGetFromTriagePage", () => {
    it("should redirect to /contact-us and carry the fromURL forward", async () => {
      req.query.fromURL = "http://localhost/enter-email";

      contactUsGetFromTriagePage(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us?fromURL=http%3A%2F%2Flocalhost%2Fenter-email"
      );
    });

    it("should not carry the fromURL forward if it is not valid", async () => {
      req.query.fromURL = "https://unsuitableurl.com";

      contactUsGetFromTriagePage(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/contact-us?");
    });

    describe("redirect to /contact-us-further-information when the theme is ID Check App", async () => {
      it("should include all ID Check App properties as query parameters when they have been provided and are valid", async () => {
        req.query.theme = CONTACT_US_THEMES.ID_CHECK_APP;
        req.query.fromURL = "http://localhost/enter-email";
        req.query.appSessionId = "1234abcd-12ab-11aa-90aa-04938abc12ab";
        req.query.appErrorCode = "aed1";

        contactUsGetFromTriagePage(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          "/contact-us-further-information?appSessionId=1234abcd-12ab-11aa-90aa-04938abc12ab&appErrorCode=aed1&fromURL=http%3A%2F%2Flocalhost%2Fenter-email&theme=id_check_app"
        );
      });

      it("should not include the fromURL when it is not valid", async () => {
        req.query.theme = CONTACT_US_THEMES.ID_CHECK_APP;
        req.query.fromURL = "https://unsuitableurl.com";
        req.query.appSessionId = "1234abcd-12ab-11aa-90aa-04938abc12ab";
        req.query.appErrorCode = "aed1";

        contactUsGetFromTriagePage(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          "/contact-us-further-information?appSessionId=1234abcd-12ab-11aa-90aa-04938abc12ab&appErrorCode=aed1&theme=id_check_app"
        );
      });

      it("should not include the appSessionId when it is not valid", async () => {
        req.query.theme = CONTACT_US_THEMES.ID_CHECK_APP;
        req.query.fromURL = "http://localhost/enter-email";
        req.query.appSessionId = "1234";
        req.query.appErrorCode = "aed1";

        contactUsGetFromTriagePage(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          "/contact-us-further-information?appErrorCode=aed1&fromURL=http%3A%2F%2Flocalhost%2Fenter-email&theme=id_check_app"
        );
      });

      it("should not include the appErrorCode when it is not valid", async () => {
        req.query.theme = CONTACT_US_THEMES.ID_CHECK_APP;
        req.query.fromURL = "http://localhost/enter-email";
        req.query.appSessionId = "1234abcd-12ab-11aa-90aa-04938abc12ab";
        req.query.appErrorCode = "abcdef";

        contactUsGetFromTriagePage(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          "/contact-us-further-information?appSessionId=1234abcd-12ab-11aa-90aa-04938abc12ab&fromURL=http%3A%2F%2Flocalhost%2Fenter-email&theme=id_check_app"
        );
      });
    });
  });

  describe("contactUsFormPost", () => {
    it("should carry forward fromURL when redirecting to /contact-us-further-information", async () => {
      req.body.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.body.referer = encodeURIComponent(REFERER);
      req.body.fromURL = encodeURIComponent("http://localhost/enter-email");

      contactUsFormPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-further-information?theme=signing_in&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email&fromURL=http%3A%2F%2Flocalhost%2Fenter-email"
      );
    });

    describe("redirect to /contact-us-further-information page", () => {
      it("should redirect when 'A problem signing in to your GOV.UK account' radio option is chosen", async () => {
        req.body.theme = CONTACT_US_THEMES.SIGNING_IN;
        req.body.referer = REFERER;

        contactUsFormPost(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          "/contact-us-further-information?theme=signing_in&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
        );
      });

      it("should redirect when 'A problem proving your identity' radio option is chosen", async () => {
        req.body.theme = CONTACT_US_THEMES.PROVING_IDENTITY;
        req.body.referer = REFERER;

        contactUsFormPost(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          `/contact-us-further-information?theme=${CONTACT_US_THEMES.PROVING_IDENTITY}&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email`
        );
      });

      it("should redirect when 'A problem creating a GOV.UK account' radio option is chosen", async () => {
        req.body.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
        req.body.referer = REFERER;

        contactUsFormPost(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          "/contact-us-further-information?theme=account_creation&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
        );
      });
    });

    describe("redirect to /contact-us-questions page", () => {
      it("should redirect when 'Another problem using your GOV.UK account' radio option is chosen", async () => {
        req.body.theme = CONTACT_US_THEMES.SOMETHING_ELSE;
        req.body.referer = REFERER;

        contactUsFormPost(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          "/contact-us-questions?theme=something_else&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
        );
      });

      it("should redirect when 'A suggestion or feedback about using your GOV.UK account' radio option is chosen", async () => {
        req.body.theme = CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK;
        req.body.referer = REFERER;

        contactUsFormPost(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          "/contact-us-questions?theme=suggestions_feedback&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
        );
      });

      it("should redirect when 'You think somebody else is using your information to access your Welcome to GOV.UK One Login' radio option is chosen", async () => {
        req.body.theme = CONTACT_US_THEMES.SUSPECT_UNAUTHORISED_ACCESS;
        req.body.referer = REFERER;

        contactUsFormPost(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          "/contact-us-questions?theme=suspect_unauthorised_access&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
        );
      });
    });
  });
});

describe("appErrorCode and appSessionId query parameters", () => {
  const validAppErrorCodes = ["abcd", "1234", "ab12", "12ab"];
  const invalidAppErrorCodes = ["abcde", "12345", "zb12", "12ag"];
  const validAppSessionIds = [
    "1234abcd-12ab-11aa-90aa-04938abc12ab",
    "abc5678a-ab12-1c56-88ed-facc89109aee",
  ];
  const invalidAppSessionIds = [
    "1234zbcd-12zb-11zz-90zz-04938zc12zb",
    "zbc5678z-zb12-1c56-88ed-fzcc89109ee",
  ];

  describe("validateAppErrorCode", () => {
    validAppErrorCodes.forEach((i) => {
      it(`should return true when passed a valid string like ${i}`, () => {
        expect(validateAppErrorCode(i)).to.be.true;
      });
    });

    invalidAppErrorCodes.forEach((i) => {
      it(`should return false when passed an invalid string like ${i}`, () => {
        expect(validateAppErrorCode(i)).to.be.false;
      });
    });
  });

  describe("getAppErrorCode", () => {
    it(`It should return "" if passed an empty string`, () => {
      expect(getAppErrorCode("")).to.equal("");
    });

    validAppErrorCodes.forEach((i) => {
      it(`should return the original string when passed a valid string like ${i}`, () => {
        expect(getAppErrorCode(i)).to.equal(i);
      });
    });

    invalidAppErrorCodes.forEach((i) => {
      it(`should return "" when passed an invalid string like ${i}`, () => {
        expect(getAppErrorCode(i)).to.be.equal("");
      });
    });
  });

  describe("validateAppSessionId", () => {
    validAppSessionIds.forEach((i) => {
      it(`should return true when passed a valid string like ${i}`, () => {
        expect(validateAppId(i)).to.be.true;
      });
    });
  });

  describe("getAppSessionId", () => {
    it(`It should return "" if passed an empty string`, () => {
      expect(getAppSessionId("")).to.be.equal("");
    });

    validAppSessionIds.forEach((i) => {
      it(`should return the original string when passed a valid string like ${i}`, () => {
        expect(getAppSessionId(i)).to.equal(i);
      });
    });

    invalidAppSessionIds.forEach((i) => {
      it(`should return "" when passed an invalid string like ${i}`, () => {
        expect(getAppErrorCode(i)).to.equal("");
      });
    });
  });

  describe("createTicketIdentifier", () => {
    validAppSessionIds.forEach((i) => {
      it(`should return the original string when passed a valid appSessionId like ${i}`, () => {
        expect(createTicketIdentifier(i)).to.equal(i);
      });
    });

    invalidAppSessionIds.forEach((i) => {
      it(`should return not return the original string when passed an invalid string like ${i}`, () => {
        expect(getAppErrorCode(i)).to.not.equal(i);
      });
    });
  });

  describe("getPreferredLanguage", () => {
    it("should return 'English' when passed 'en'", () => {
      expect(getPreferredLanguage("en")).to.equal("English");
    });

    it("should return 'Welsh' when passed 'en'", () => {
      expect(getPreferredLanguage("cy")).to.equal("Welsh");
    });

    it("should return 'Language code note set' when passed an unexpected value", () => {
      expect(getPreferredLanguage("ex")).to.equal("Language code not set");
    });
  });

  describe("isAppJourney", () => {
    validAppSessionIds.forEach((i) => {
      it(`should return true when passed a valid appSessionId like ${i}`, () => {
        expect(isAppJourney(i)).to.be.true;
      });
    });

    invalidAppSessionIds.forEach((i) => {
      it(`should return false when passed a invalid appSessionId like ${i}`, () => {
        expect(isAppJourney(i)).to.be.false;
      });
    });
  });

  describe("validateReferer", () => {
    const serviceDomain = "account.gov.uk";
    const validReferers = [
      "https://app.staging.account.gov.uk",
      "https://integration.account.gov.uk",
      "https://account.gov.uk",
    ];
    const badReferers = ["https://app.staging.account.gov", "https://gov.uk"];
    const referersWithoutScheme = [
      "app.staging.account.gov.uk",
      "account.gov.uk",
    ];

    it("should return the referer for all values in the allow list", () => {
      CONTACT_US_REFERER_ALLOWLIST.forEach((item) => {
        expect(validateReferer(item, serviceDomain)).to.equal(item);
      });
    });

    it("should return the referer when the referer ends with the service domain", () => {
      validReferers.forEach((item) => {
        expect(validateReferer(item, serviceDomain)).to.equal(item);
      });
    });

    it("should return an empty string when the referer does not end with the service domain", () => {
      badReferers.forEach((item) => {
        expect(validateReferer(item, serviceDomain)).to.equal("");
      });
    });

    it("should throw if passed a referer that is not a URL", () => {
      referersWithoutScheme.forEach((item) => {
        expect(validateReferer(item, serviceDomain)).to.equal("");
      });
    });

    it("should return the URL when it is encoded as a URI component", () => {
      validReferers.forEach((item) => {
        const encodedItem = encodeURIComponent(item);
        expect(validateReferer(encodedItem, serviceDomain)).to.equal(
          decodeURIComponent(encodedItem)
        );
      });
    });
  });
});

describe("prepareBackLink", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let supportLinkURL: string;
  let serviceDomain: string;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    serviceDomain = getServiceDomain();
    supportLinkURL = getSupportLinkUrl();

    req = {
      url: "",
      path: "",
      body: {},
      query: {},
      headers: {},
      get: sandbox.fake() as unknown as RequestGet,
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("should return the supportLinkURL when the req.path ends with the CONTACT_US path", () => {
    req.path = PATH_NAMES.CONTACT_US;
    expect(
      prepareBackLink(req as Request, supportLinkURL, serviceDomain)
    ).to.equal(supportLinkURL);
  });

  it("should return the CONTACT_US_FURTHER_INFORMATION path when the req.path ends with the CONTACT_US_QUESTIONS path and has req.query.subtheme", () => {
    req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
    req.query.subtheme = "testSubtheme";
    expect(
      prepareBackLink(req as Request, supportLinkURL, serviceDomain)
    ).to.equal(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION);
  });

  it("should return the CONTACT_US path when the req.path ends with the CONTACT_US_QUESTIONS path and doesn't have req.query.subtheme", () => {
    req.path = PATH_NAMES.CONTACT_US_QUESTIONS;
    expect(
      prepareBackLink(req as Request, supportLinkURL, serviceDomain)
    ).to.equal(PATH_NAMES.CONTACT_US);
  });

  it("should return the supportLinkURL with a fromURL parameter when one is included in the req.url", () => {
    req.query.fromURL = `https://${getServiceDomain()}${PATH_NAMES.CONTACT_US}`;
    const fromURL =
      "?fromURL=" +
      encodeURIComponent(
        `https://${getServiceDomain()}${PATH_NAMES.CONTACT_US}`
      );

    expect(
      prepareBackLink(req as Request, supportLinkURL, serviceDomain)
    ).to.equal(supportLinkURL + fromURL);
  });

  it("should omit the fromURL from the backlink where the one included in req.url is not valid", () => {
    req.url = `https://${getServiceDomain()}${
      PATH_NAMES.CONTACT_US
    }?fromURL=${encodeURIComponent("https://www.example.com")}`;

    expect(
      prepareBackLink(req as Request, supportLinkURL, serviceDomain)
    ).to.equal(supportLinkURL);
  });

  it("should include the `theme` where the theme is valid", () => {
    req.query.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
    req.url = `https://${getServiceDomain()}${PATH_NAMES.CONTACT_US}?theme=${
      CONTACT_US_THEMES.ACCOUNT_CREATION
    }`;

    const theme = `?theme=${CONTACT_US_THEMES.ACCOUNT_CREATION}`;

    expect(
      prepareBackLink(req as Request, supportLinkURL, serviceDomain)
    ).to.equal(supportLinkURL + theme);
  });

  describe("dynamic back links on CONTACT_US_FURTHER_INFORMATION", () => {
    it("should default to returning the CONTACT_US path", () => {
      req.path = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
      expect(
        prepareBackLink(req as Request, supportLinkURL, serviceDomain)
      ).to.equal(PATH_NAMES.CONTACT_US);
    });
    it("should return the `supportLinkURL` if there is a fromURL and the theme is ID_CHECK_APP", () => {
      req.path = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
      req.query.fromURL = PATH_NAMES.DOC_CHECKING_APP;
      req.query.theme = CONTACT_US_THEMES.ID_CHECK_APP;
      expect(
        prepareBackLink(req as Request, supportLinkURL, serviceDomain)
      ).to.equal(`${supportLinkURL}?theme=${CONTACT_US_THEMES.ID_CHECK_APP}`);
    });
  });
});

describe("getNextUrlBasedOnTheme", () => {
  it("should return the URL for CONTACT_US_FURTHER_INFORMATION where the form has supplemental options", () => {
    expect(getNextUrlBasedOnTheme("")).to.equal(
      PATH_NAMES.CONTACT_US_QUESTIONS
    );
    expect(getNextUrlBasedOnTheme(CONTACT_US_THEMES.ACCOUNT_CREATION)).to.equal(
      PATH_NAMES.CONTACT_US_FURTHER_INFORMATION
    );
    expect(getNextUrlBasedOnTheme(CONTACT_US_THEMES.SIGNING_IN)).to.equal(
      PATH_NAMES.CONTACT_US_FURTHER_INFORMATION
    );
    expect(getNextUrlBasedOnTheme(CONTACT_US_THEMES.ID_CHECK_APP)).to.equal(
      PATH_NAMES.CONTACT_US_FURTHER_INFORMATION
    );
    expect(
      getNextUrlBasedOnTheme(CONTACT_US_THEMES.PROVING_IDENTITY_FACE_TO_FACE)
    ).to.equal(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION);
    expect(getNextUrlBasedOnTheme(CONTACT_US_THEMES.PROVING_IDENTITY)).to.equal(
      PATH_NAMES.CONTACT_US_FURTHER_INFORMATION
    );
  });
});

describe("contactUsQuestionsFormPostToSmartAgent", () => {
  const mockContactUsSubmitFormSmartAgent = sinon.fake.resolves(undefined);
  let mockContactUsQuestionsFormPostToSmartAgent: ExpressRouteFunc;
  beforeEach(() => {
    mockContactUsSubmitFormSmartAgent.resetHistory();

    mockContactUsQuestionsFormPostToSmartAgent =
      contactUsQuestionsFormPostToSmartAgent({
        contactUsSubmitFormSmartAgent: mockContactUsSubmitFormSmartAgent,
      });
  });

  describe("telephoneNumber", () => {
    [
      {
        phoneNumber: "07123123456",
        internationalPhoneNumber: undefined,
        hasInternationalPhoneNumber: undefined,
        expectedTelephoneNumber: "07123123456",
      },
      {
        phoneNumber: undefined,
        internationalPhoneNumber: "+447123123456",
        hasInternationalPhoneNumber: "true",
        expectedTelephoneNumber: "+447123123456",
      },
      {
        phoneNumber: "+44111111111",
        internationalPhoneNumber: "+44222222222",
        hasInternationalPhoneNumber: undefined,
        expectedTelephoneNumber: "+44111111111",
      },
      {
        phoneNumber: "+44111111111",
        internationalPhoneNumber: "+44222222222",
        hasInternationalPhoneNumber: "true",
        expectedTelephoneNumber: "+44222222222",
      },
    ].forEach(
      ({
        phoneNumber,
        internationalPhoneNumber,
        hasInternationalPhoneNumber,
        expectedTelephoneNumber,
      }) => {
        it(`should return ${expectedTelephoneNumber} for - hasInternationalPhoneNumber: ${hasInternationalPhoneNumber}, uk: ${phoneNumber} international: ${internationalPhoneNumber}`, async () => {
          // arrange
          const mockRequest = createMockRequest("/contact-us-questions");
          mockRequest.body.phoneNumber = phoneNumber;
          mockRequest.body.internationalPhoneNumber = internationalPhoneNumber;
          mockRequest.body.hasInternationalPhoneNumber =
            hasInternationalPhoneNumber;

          // act
          await mockContactUsQuestionsFormPostToSmartAgent(
            mockRequest,
            mockResponse()
          );

          // assert
          sinon.assert.calledOnce(mockContactUsSubmitFormSmartAgent);
          const call = mockContactUsSubmitFormSmartAgent.getCall(0);
          const contactForm: ContactForm = call.firstArg;
          expect(contactForm.telephoneNumber).to.equal(expectedTelephoneNumber);
        });
      }
    );
  });
});
