import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  contactUsFormPost,
  contactUsGet,
  contactUsSubmitSuccessGet,
} from "../contact-us-controller";
import { SUPPORT_TYPE } from "../../../app.constants";
import { ContactUsServiceInterface } from "../types";

describe("contact us controller", () => {
  let sandbox: sinon.SinonSandbox;
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = { body: {}, query: {} };
    res = { render: sandbox.fake(), redirect: sandbox.fake() };
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
  });

  describe("contactUsSubmitSuccessGet", () => {
    it("should render contact us success page", () => {
      contactUsSubmitSuccessGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "contact-us/index-submit-success.njk"
      );
    });
  });

  describe("contactUsFormPost", () => {
    it("should redirect /contact-us-submit-success page when ticket posted", async () => {
      const fakeService: ContactUsServiceInterface = {
        contactUsSubmitForm: sandbox.fake(),
      };

      await contactUsFormPost(fakeService)(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith("/contact-us-submit-success");
    });
  });
});
