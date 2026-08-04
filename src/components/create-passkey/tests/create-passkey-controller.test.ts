import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { Request } from "express";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import {
  createPasskeyGet,
  createPasskeyPost,
} from "../create-passkey-controller.js";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import type { AmcAuthorizeInterface } from "../../amc-service/types.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { strict as assert } from "assert";
import { BadRequestError } from "../../../utils/error.js";
import {
  UpdateType,
  type UpdateProfileServiceInterface,
} from "../../common/update-profile/types.js";

describe("create passkey controller", () => {
  let res: ResponseOutput;
  let req: RequestOutput;

  const REDIRECT_URL = "https://example.com";
  const AMC_COOKIE = "some-hashed-value";
  const fakeAmcAuthorizeService = (
    successfulAuthorizeResponse: boolean,
    cookie?: string
  ) => {
    const data = successfulAuthorizeResponse
      ? {
          redirectUrl: REDIRECT_URL,
          amcCookie: cookie,
          code: HTTP_STATUS_CODES.OK,
        }
      : {
          code: HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: "Test error message",
        };
    return {
      getRedirectUrl: sinon.fake.returns({
        success: successfulAuthorizeResponse,
        data,
      }),
    } as unknown as AmcAuthorizeInterface;
  };

  const fakeUpdateProfileService = (
    returnSuccess: boolean
  ): UpdateProfileServiceInterface => {
    return {
      updateProfile: sinon.fake.returns({
        success: returnSuccess,
      }),
    } as unknown as UpdateProfileServiceInterface;
  };

  beforeEach(() => {
    res = mockResponse();
    req = createMockRequest(PATH_NAMES.CREATE_PASSKEY_CALLBACK);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("createPasskeyGet", () => {
    it("should render create passkey page", () => {
      createPasskeyGet(req, res);

      expect(res.render).to.have.been.calledWith("create-passkey/index.njk");
    });
  });

  describe("createPasskeyPost", () => {
    const createRequestWithPasskeyOption = (createPasskeyOption: string) => {
      return {
        body: { createPasskeyOption: createPasskeyOption },
        session: {
          user: {},
          save: sinon.spy((callback) => callback(null)),
        },
        log: {
          debug: sinon.spy(),
          info: sinon.spy(),
          warn: sinon.spy(),
          error: sinon.spy(),
        },
      } as unknown as Request;
    };

    it("should set the amc cookie and redirect to the url of the amc authorization response when submit button is clicked", async () => {
      const req = createRequestWithPasskeyOption("submit");

      await createPasskeyPost(fakeAmcAuthorizeService(true, AMC_COOKIE))(
        req,
        res
      );

      expect(res.cookie).to.have.been.calledWith("amc", AMC_COOKIE, {
        secure: true,
        httpOnly: true,
        domain: "localhost",
      });

      expect(res.redirect).calledWith(REDIRECT_URL);
    });

    it("should return an error when amc authorize endpoint returns non successful result", async () => {
      const req = createRequestWithPasskeyOption("submit");

      await assert.rejects(
        async () => createPasskeyPost(fakeAmcAuthorizeService(false))(req, res),
        BadRequestError
      );
    });

    it("should return an error when amc authorize endpoint returns empty amc cookie", async () => {
      const req = createRequestWithPasskeyOption("submit");

      await assert.rejects(
        async () =>
          createPasskeyPost(fakeAmcAuthorizeService(true, null))(req, res),
        Error
      );
    });

    it("should set hasSkippedPasskeyRegistration when skip button is clicked", async () => {
      const req = createRequestWithPasskeyOption("skip");

      const updateProfileService = fakeUpdateProfileService(true);
      await createPasskeyPost(
        fakeAmcAuthorizeService(true, AMC_COOKIE),
        updateProfileService
      )(req, res);

      expect(req.session.user.hasSkippedPasskeyRegistration).to.be.true;
      expect(req.session.save).to.have.been.called;
    });

    it("should call update profile with skip action when skip button is clicked", async () => {
      const req = createRequestWithPasskeyOption("skip");
      req.session.user.email = "test@example.com";
      res.locals.sessionId = "session-123";
      res.locals.clientSessionId = "client-session-123";
      res.locals.persistentSessionId = "persistent-session-123";

      const updateProfileReturnsSuccess = true;
      const updateProfileService = fakeUpdateProfileService(
        updateProfileReturnsSuccess
      );

      await createPasskeyPost(
        fakeAmcAuthorizeService(true, AMC_COOKIE),
        updateProfileService
      )(req, res);

      expect(updateProfileService.updateProfile).to.have.been.calledOnce;
      expect(updateProfileService.updateProfile).to.have.been.calledWith(
        "session-123",
        "client-session-123",
        "test@example.com",
        UpdateType.SKIP_ADDING_PASSKEY,
        "persistent-session-123",
        req
      );
    });

    it("should not throw error if the call to the update profile service fails", async () => {
      const req = createRequestWithPasskeyOption("skip");

      const updateProfileReturnsSuccess = false;
      const updateProfileService = fakeUpdateProfileService(
        updateProfileReturnsSuccess
      );

      await createPasskeyPost(
        fakeAmcAuthorizeService(true, AMC_COOKIE),
        updateProfileService
      )(req, res);

      expect(updateProfileService.updateProfile).to.have.been.calledOnce;

      expect(req.log.warn).to.have.been.calledOnce;

      expect(req.session.user.hasSkippedPasskeyRegistration).to.be.true;
      expect(req.session.save).to.have.been.called;
      expect(res.redirect).to.have.been.called;
    });

    it("should not set hasSkippedPasskeyRegistration or call update profile when submit button is clicked", async () => {
      const req = createRequestWithPasskeyOption("submit");
      const updateProfileService = fakeUpdateProfileService(true);

      await createPasskeyPost(
        fakeAmcAuthorizeService(true, AMC_COOKIE),
        updateProfileService
      )(req, res);

      expect(req.session.user.hasSkippedPasskeyRegistration).to.be.undefined;
      expect(updateProfileService.updateProfile).not.to.have.been.called;
    });
  });
});
