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

describe("create passkey controller", () => {
  let res: ResponseOutput;
  let req: RequestOutput;

  const REDIRECT_URL = "https://example.com";
  const fakeAmcAuthorizeService = (successfulAuthorizeResponse: boolean) => {
    return {
      getRedirectUrl: sinon.fake.returns({
        success: successfulAuthorizeResponse,
        data: {
          redirectUrl: successfulAuthorizeResponse ? REDIRECT_URL : null,
          code: successfulAuthorizeResponse
            ? HTTP_STATUS_CODES.OK
            : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
          message: successfulAuthorizeResponse ? null : "Test error message",
        },
      }),
    } as unknown as AmcAuthorizeInterface;
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
          error: sinon.spy(),
        },
      } as unknown as Request;
    };

    it("should redirect to the url of the amc authorization response when submit button is clicked", async () => {
      const req = createRequestWithPasskeyOption("submit");

      await createPasskeyPost(fakeAmcAuthorizeService(true))(req, res);

      expect(res.redirect).calledWith(REDIRECT_URL);
    });

    it("should return an error when amc authorize endpoint returns non successful result", async () => {
      const req = createRequestWithPasskeyOption("submit");

      await assert.rejects(
        async () => createPasskeyPost(fakeAmcAuthorizeService(false))(req, res),
        BadRequestError,
        "500:Test error message"
      );
    });

    it("should set hasSkippedPasskeyRegistration when skip button is clicked", async () => {
      const req = createRequestWithPasskeyOption("skip");

      await createPasskeyPost(fakeAmcAuthorizeService(true))(req, res);

      expect(req.session.user.hasSkippedPasskeyRegistration).to.be.true;
      expect(req.session.save).to.have.been.called;
    });

    it("should not set hasSkippedPasskeyRegistration when submit button is clicked", async () => {
      const req = createRequestWithPasskeyOption("submit");

      await createPasskeyPost(fakeAmcAuthorizeService(true))(req, res);

      expect(req.session.user.hasSkippedPasskeyRegistration).to.be.undefined;
    });
  });
});
