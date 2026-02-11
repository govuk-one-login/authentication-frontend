import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import sinon from "sinon";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import { sfadAuthorizeGet } from "../sfad-authorize-controller.js";
import { expect } from "chai";
import type { SfadAuthorizeInterface } from "../types.js";
import type { Request, Response } from "express";
import { BadRequestError } from "../../../utils/error.js";
import { strict as assert } from "assert";
import { describe } from "mocha";

const SFAD_REDIRECT_URL = "https://test-amc-url.com/authorize?state=test-state";

const fakeSfadAuthorizeService = (successfulAuthorizeResponse: boolean) => {
  return {
    getRedirectUrl: sinon.fake.returns({
      success: successfulAuthorizeResponse,
      data: {
        redirectUrl: successfulAuthorizeResponse ? SFAD_REDIRECT_URL : null,
        code: successfulAuthorizeResponse
          ? HTTP_STATUS_CODES.OK
          : HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
        message: successfulAuthorizeResponse ? null : "Test error message",
      },
    }),
  } as unknown as SfadAuthorizeInterface;
};

describe("sfad authorize controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.SFAD_AUTHORIZE);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("sfadAuthorizeGet", () => {
    it("should redirect to SFAD URL when request is successful", async () => {
      await sfadAuthorizeGet(fakeSfadAuthorizeService(true))(
        req as Request,
        res as Response
      );
      expect(res.redirect).to.have.been.calledWith(SFAD_REDIRECT_URL);
    });

    it("should throw a BadRequestError when the request is not successful", async () => {
      await assert.rejects(
        async () =>
          sfadAuthorizeGet(fakeSfadAuthorizeService(false))(
            req as Request,
            res as Response
          ),
        BadRequestError,
        "500:Test error message"
      );
    });
  });
});
