import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  updatedTermsConditionsGet,
  updatedTermsConditionsPost,
} from "../updated-terms-conditions-controller";

import { UpdateProfileServiceInterface } from "../../common/update-profile/types";
import { EXTERNAL_LINKS, PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("updated terms conditions controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      session: { client: {}, user: {}, destroy: sinon.fake() },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("updatedTermsCondsGet", () => {
    it("should render updated-terms-conditions page", async () => {
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";

      await updatedTermsConditionsGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "updated-terms-conditions/index.njk"
      );
    });
  });

  describe("updatedTermsCondsPost", () => {
    it("should redirect to /auth-code when terms accepted", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({
          success: true,
          sessionState: "UPDATED_TERMS_AND_CONDITIONS_ACCEPTED",
        }),
      } as unknown as UpdateProfileServiceInterface;

      req.path = PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS;
      req.body.termsAndConditionsResult = "accept";
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user.email = "test@test.com";

      await updatedTermsConditionsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.AUTH_CODE);
    });

    it("should redirect to /share-info when consent required", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({
          success: true,
        }),
      } as unknown as UpdateProfileServiceInterface;

      req.path = PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS;
      req.session.client.consentEnabled = true;
      req.session.user.isConsentRequired = true;
      req.body.termsAndConditionsResult = "accept";
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user.email = "test@test.com";

      await updatedTermsConditionsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.SHARE_INFO);
    });

    it("should redirect to govUK website when termsAndConditionsResult has value govUk", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake(),
      };

      req.body.termsAndConditionsResult = "govUk";
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user.email = "test@test.com";

      await updatedTermsConditionsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.updateProfile).not.to.been.called;
      expect(res.redirect).to.have.been.calledWith(EXTERNAL_LINKS.GOV_UK);
    });

    it("should redirect to support page when termsAndConditionsResult has value contactUs", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake(),
      };

      req.body.termsAndConditionsResult = "contactUs";
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.user.email = "test@test.com";

      await updatedTermsConditionsPost(fakeService)(
        req as Request,
        res as Response
      );

      expect(fakeService.updateProfile).not.to.been.called;
      expect(res.redirect).to.have.calledWith(
        `${PATH_NAMES.CONTACT_US}?supportType=PUBLIC`
      );
    });
  });
});
