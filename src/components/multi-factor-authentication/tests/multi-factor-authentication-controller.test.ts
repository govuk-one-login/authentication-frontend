import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants";
import {
  getSecurityCodesGet,
  getSecurityCodesPost,
} from "../multi-factor-authentication-controller";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("mutil-factor-authentication controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.GET_SECURITY_CODES,
      session: { client: {}, user: {} },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("getSecurityCodesGet", () => {
    it("should render get-security-codes page", () => {
      getSecurityCodesGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith(
        "multi-factor-authentication/get-security-codes.njk"
      );
    });
  });

  describe("getSecurityCodesPost", () => {
    it("should redirect to /enter-phone-number when text message selected", async () => {
      req.body.mfaOptions = "SMS";

      getSecurityCodesPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER
      );
    });

    it("should redirect to /enter-phone-number even when auth app selected until add code screen implemented", async () => {
      req.body.mfaOptions = "AUTH_APP";

      getSecurityCodesPost(req as Request, res as Response);

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER
      );
    });
  });
});
