import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { shareInfoGet, shareInfoPost } from "../share-info-controller";

import { BadRequestError } from "../../../utils/error";
import { UpdateProfileServiceInterface } from "../../common/update-profile/types";
import { PATH_NAMES } from "../../../app.constants";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

describe("share-info controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.SHARE_INFO,
      session: {
        client: { name: "clientname", scopes: ["openid", "email", "phone"] },
        user: {},
      },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("shareInfoGet", () => {
    it("should render share-info page", () => {
      shareInfoGet(req as Request, res as Response);

      expect(res.render).to.have.calledWith("share-info/index.njk");
    });
  });

  describe("shareInfoPost", () => {
    it("should redirect to /auth-code when accepted sharing info", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({
          success: true,
        }),
      } as unknown as UpdateProfileServiceInterface;

      req.body.consentValue = true;
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      res.locals.persistentSessionId = "dips-123456-abc";
      req.session.user.email = "test@test.com";

      await shareInfoPost(fakeService)(req as Request, res as Response);

      expect(fakeService.updateProfile).to.have.been.calledOnce;
      expect(res.redirect).to.have.calledWith(PATH_NAMES.AUTH_CODE);
    });
  });

  describe("shareInfoPostError", () => {
    it("should throw error when update profile returns false", async () => {
      const fakeService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({
          success: false,
          data: { code: "1000", message: "error" },
        }),
      } as unknown as UpdateProfileServiceInterface;

      req.body.consentValue = true;
      res.locals.sessionId = "s-123456-djjad";
      res.locals.clientSessionId = "c-123456-djjad";
      req.session.user.email = "test@test.com";

      await expect(
        shareInfoPost(fakeService)(req as Request, res as Response)
      ).to.be.rejectedWith(BadRequestError, "1000:error");

      expect(fakeService.updateProfile).to.have.been.calledOnce;
    });
  });
});
