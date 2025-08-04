import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request, Response } from "express";
import {
  furtherInformationGet,
  furtherInformationPost,
} from "../contact-us-controller.js";
import { CONTACT_US_THEMES, PATH_NAMES } from "../../../app.constants.js";
import type { RequestGet, ResponseRedirect } from "../../../types.js";
import { supportNoPhotoIdContactForms } from "../../../config.js";

describe("contact us further information controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;
  const REFERER = "http://localhost:3000/enter-email";

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, query: {}, get: sandbox.fake() as unknown as RequestGet };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake() as unknown as ResponseRedirect,
      locals: {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("furtherInformationGet", () => {
    it("should render signing in further information if a problem signing in to your account radio option was chosen", () => {
      req.query.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.query.referer = REFERER;
      req.path = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
      furtherInformationGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWithMatch(
        "contact-us/further-information/index.njk",
        sinon.match({
          theme: "signing_in",
          referer: encodeURIComponent(REFERER),
          hrefBack: `${PATH_NAMES.CONTACT_US}?theme=${CONTACT_US_THEMES.SIGNING_IN}`,
          radioButtons: sinon.match.any,
          title: sinon.match.any,
          header: sinon.match.any,
          legend: sinon.match.any,
        })
      );
    });

    it("should render account creation further information if a creating an account radio option was chosen", () => {
      req.path = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
      req.query.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.query.referer = REFERER;
      furtherInformationGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWithMatch(
        "contact-us/further-information/index.njk",
        sinon.match({
          theme: "account_creation",
          referer: encodeURIComponent(REFERER),
          hrefBack: `${PATH_NAMES.CONTACT_US}?theme=${CONTACT_US_THEMES.ACCOUNT_CREATION}`,
          radioButtons: sinon.match.any,
          title: sinon.match.any,
          header: sinon.match.any,
          legend: sinon.match.any,
        })
      );
    });

    it("should render wallet further information if a wallet radio option was chosen", () => {
      req.path = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
      req.query.theme = CONTACT_US_THEMES.WALLET;
      req.query.referer = REFERER;
      furtherInformationGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/further-information/index.njk",
        {
          theme: "wallet",
          referer: encodeURIComponent(REFERER),
          hrefBack: `${PATH_NAMES.CONTACT_US}?theme=${CONTACT_US_THEMES.WALLET}`,
          supportNoPhotoIdContactForms: false,
        }
      );
    });

    it("should redirect to contact-us when no theme is present in request", () => {
      req.path = PATH_NAMES.CONTACT_US_FURTHER_INFORMATION;
      furtherInformationGet(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/contact-us");
    });
  });

  describe("signingInFurtherInformationPost", () => {
    it("should redirect /contact-us-questions page when 'You did not receive a security code' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.body.subtheme = CONTACT_US_THEMES.NO_SECURITY_CODE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=no_security_code&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'The security code did not work' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.body.subtheme = CONTACT_US_THEMES.INVALID_SECURITY_CODE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=invalid_security_code&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'You do not have access to the phone number' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.body.subtheme = CONTACT_US_THEMES.NO_PHONE_NUMBER_ACCESS;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=no_phone_number_access&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'You’ve forgotten your password' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.body.subtheme = CONTACT_US_THEMES.FORGOTTEN_PASSWORD;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=forgotten_password&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'Your account cannot be found' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.body.subtheme = CONTACT_US_THEMES.ACCOUNT_NOT_FOUND;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=account_not_found&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'There was a technical problem' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.body.subtheme = CONTACT_US_THEMES.TECHNICAL_ERROR;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=technical_error&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'Something else' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.SIGNING_IN;
      req.body.subtheme = CONTACT_US_THEMES.SOMETHING_ELSE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=signing_in&subtheme=something_else&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
  });

  describe("accountCreationFurtherInformationPost", () => {
    it("should redirect /contact-us-questions page when 'You did not receive a security code' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = CONTACT_US_THEMES.NO_SECURITY_CODE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=no_security_code&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'The security code did not work' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = CONTACT_US_THEMES.INVALID_SECURITY_CODE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=invalid_security_code&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'You do not have a UK mobile phone number' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = CONTACT_US_THEMES.SIGN_IN_PHONE_NUMBER_ISSUE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=sign_in_phone_number_issue&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'There was a technical problem' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = CONTACT_US_THEMES.TECHNICAL_ERROR;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=technical_error&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
    it("should redirect /contact-us-questions page when 'Something else' radio option is chosen", async () => {
      req.body.theme = CONTACT_US_THEMES.ACCOUNT_CREATION;
      req.body.subtheme = CONTACT_US_THEMES.SOMETHING_ELSE;
      req.body.referer = REFERER;
      furtherInformationPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        "/contact-us-questions?theme=account_creation&subtheme=something_else&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email"
      );
    });
  });

  describe("walletFurtherInformationPost", () => {
    [
      {
        subtheme: "wallet_problem_opening_app",
        radioOption: "You had a problem opening the GOV.UK One Login app",
      },
      {
        subtheme: "wallet_problem_adding_credentials_document",
        radioOption:
          "You had a problem adding your Veteran Card to the GOV.UK One Login app",
      },
      {
        subtheme: "wallet_problem_viewing_credentials_document",
        radioOption:
          "You had a problem viewing your Veteran Card in the GOV.UK One Login app",
      },
      {
        subtheme: "wallet_technical_problem",
        radioOption:
          "There was a technical problem (for example you saw an error message)",
      },
      {
        subtheme: "wallet_something_else",
        radioOption: "Something else",
      },
    ].forEach(({ subtheme, radioOption }) => {
      it(`should redirect /contact-us-questions page when '${radioOption}' radio option is chosen`, async () => {
        req.body.theme = CONTACT_US_THEMES.WALLET;
        req.body.subtheme = subtheme;
        req.body.referer = REFERER;
        furtherInformationPost(req as Request, res as Response);

        expect(res.redirect).to.have.calledWith(
          `/contact-us-questions?theme=wallet&subtheme=${subtheme}&referer=http%3A%2F%2Flocalhost%3A3000%2Fenter-email`
        );
      });
    });
  });

  describe("supportNoPhotoIdContactForms() with the support No photo id contact forms", () => {
    it("should return true when NO_PHOTO_ID_CONTACT_FORMS is set to '1'", async () => {
      process.env.NO_PHOTO_ID_CONTACT_FORMS = "1";
      expect(supportNoPhotoIdContactForms()).to.be.true;
    });

    it("should return false  when NO_PHOTO_ID_CONTACT_FORMS is set to '0'", async () => {
      process.env.NO_PHOTO_ID_CONTACT_FORMS = "0";
      expect(supportNoPhotoIdContactForms()).to.be.false;
    });

    it("should return false when NO_PHOTO_ID_CONTACT_FORMS is undefined", async () => {
      process.env.NO_PHOTO_ID_CONTACT_FORMS = undefined;
      expect(supportNoPhotoIdContactForms()).to.be.false;
    });
  });
});
