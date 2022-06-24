import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import { PATH_NAMES } from "../../../app.constants";
import {
  setupAuthenticatorAppGet,
  setupAuthenticatorAppPost,
} from "../setup-authenticator-app-controller";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";
import { UpdateProfileServiceInterface } from "../../common/update-profile/types";
import { AuthAppServiceInterface } from "../types";
import { ERROR_CODES } from "../../common/constants";
import { BadRequestError } from "../../../utils/error";

describe("setup-authenticator-app controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP,
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

  describe("setupAuthenticatorAppGet", () => {
    it("should render setup-authenticator page", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";

      await setupAuthenticatorAppGet(req as Request, res as Response);

      expect(res.render).to.have.been.calledWith(
        "setup-authenticator-app/index.njk"
      );
    });
  });

  describe("setupAuthenticatorAppPost", () => {
    it("should successfully validate access code and redirect to account created", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.body.code = "123456";

      const updateProfileService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({ success: true }),
      };

      const fakeMfAService: AuthAppServiceInterface = {
        verifyAccessCode: sinon.fake.returns({ success: true }),
      };

      await setupAuthenticatorAppPost(fakeMfAService, updateProfileService)(
        req as Request,
        res as Response
      );

      expect(updateProfileService.updateProfile).to.have.been.calledOnce;
      expect(fakeMfAService.verifyAccessCode).to.have.been.calledOnce;

      expect(res.redirect).to.have.calledWith(
        PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL
      );
    });

    it("should return validation error when incorrect code", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.body.code = "123456";

      const updateProfileService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({ success: true }),
      };

      const fakeMfAService: AuthAppServiceInterface = {
        verifyAccessCode: sinon.fake.returns({
          success: false,
          data: { code: ERROR_CODES.AUTH_APP_INVALID_CODE },
        }),
      };

      await setupAuthenticatorAppPost(fakeMfAService, updateProfileService)(
        req as Request,
        res as Response
      );

      expect(updateProfileService.updateProfile).to.have.been.calledOnce;
      expect(fakeMfAService.verifyAccessCode).to.have.been.calledOnce;

      expect(res.render).to.have.been.calledWith(
        "setup-authenticator-app/index.njk"
      );
    });

    it("should successfully validate access code and redirect to iPV", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.session.user.isIdentityRequired = true;
      req.body.code = "123456";

      const updateProfileService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({ success: true }),
      };

      const fakeMfAService: AuthAppServiceInterface = {
        verifyAccessCode: sinon.fake.returns({ success: true }),
      };

      await setupAuthenticatorAppPost(fakeMfAService, updateProfileService)(
        req as Request,
        res as Response
      );

      expect(updateProfileService.updateProfile).to.have.been.calledOnce;
      expect(fakeMfAService.verifyAccessCode).to.have.been.calledOnce;

      expect(res.redirect).to.have.calledWith(PATH_NAMES.PROVE_IDENTITY);
    });

    it("should throw error when failed to update profile", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.body.code = "123456";

      const updateProfileService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({
          success: false,
          data: {
            code: "1234",
            message: "error",
          },
        }),
      };

      const fakeMfAService: AuthAppServiceInterface = {
        verifyAccessCode: sinon.fake.returns({ success: true }),
      };

      await expect(
        setupAuthenticatorAppPost(fakeMfAService, updateProfileService)(
          req as Request,
          res as Response
        )
      ).to.be.rejectedWith(BadRequestError, "1234:error");

      expect(updateProfileService.updateProfile).to.have.been.calledOnce;
    });

    it("should throw error when not a valid error from verify access code", async () => {
      req.session.user.authAppSecret = "testsecret";
      req.session.user.email = "t@t.com";
      req.body.code = "123456";

      const updateProfileService: UpdateProfileServiceInterface = {
        updateProfile: sinon.fake.returns({
          success: true,
        }),
      };

      const fakeMfAService: AuthAppServiceInterface = {
        verifyAccessCode: sinon.fake.returns({
          success: false,
          data: {
            code: "1234",
            message: "error",
          },
        }),
      };

      await expect(
        setupAuthenticatorAppPost(fakeMfAService, updateProfileService)(
          req as Request,
          res as Response
        )
      ).to.be.rejectedWith(BadRequestError, "1234:error");

      expect(updateProfileService.updateProfile).to.have.been.calledOnce;
    });
  });
});
