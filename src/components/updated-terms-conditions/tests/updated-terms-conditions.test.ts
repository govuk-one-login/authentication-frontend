import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  updatedTermsConditionsGet,
  updatedTermsConditionsPost,
} from "../updated-terms-conditions-controller";

import { ClientInfoServiceInterface } from "../../common/client-info/types";
import { UpdateProfileServiceInterface } from "../../common/update-profile/types";

describe("updated terms conditions controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {
      body: {},
      session: {
        destroy: sandbox.fake(),
      },
      i18n: { language: "en" },
    };
    res = {
      render: sandbox.fake(),
      redirect: sandbox.fake(),
      status: sandbox.fake(),
      locals: {},
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("updatedTermsCondsGet", () => {
    it("should render updated-terms-conditions page", async () => {
      const fakeService: ClientInfoServiceInterface = {
        clientInfo: sandbox.fake.returns({
          success: true,
          data: {
            scopes: ["openid", "profile"],
            redirectUi: "http://local",
          },
        }),
      };

      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";

      await updatedTermsConditionsGet(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.clientInfo).to.be.calledOnce;
      expect(res.render).to.have.calledWith(
        "updated-terms-conditions/index.njk"
      );
    });
  });

  describe("updatedTermsCondsPost", () => {
    it("should redirect to /auth-code when termsAndConditionsResult has value accept", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sandbox.fake.returns({
          success: true,
          sessionState: "UPDATED_TERMS_AND_CONDITIONS_ACCEPTED",
        }),
      };

      req.body.termsAndConditionsResult = "accept";
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.email = "test@test.com";

      await updatedTermsConditionsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith("/auth-code");
    });

    it("should redirect to govUK website when termsAndConditionsResult has value govUk", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sandbox.fake(),
      };

      req.session.redirectUri = "http://test.test";
      req.body.termsAndConditionsResult = "govUk";
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.email = "test@test.com";
      req.session.state = "test";

      await updatedTermsConditionsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.updateProfile).not.to.been.called;
      expect(res.redirect).to.have.calledWith("https://www.gov.uk/");
    });

    it("should redirect to support page when termsAndConditionsResult has value contactUs", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sandbox.fake(),
      };

      req.session.redirectUri = "http://test.test";
      req.body.termsAndConditionsResult = "contactUs";
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.email = "test@test.com";
      req.session.state = "test";

      await updatedTermsConditionsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.updateProfile).not.to.been.called;
      expect(res.redirect).to.have.calledWith("/contact-us?supportType=PUBLIC");
    });
  });
});
