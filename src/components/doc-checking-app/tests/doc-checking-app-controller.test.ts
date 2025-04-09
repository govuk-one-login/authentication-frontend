import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils.js";
import { Request, Response } from "express";

import { DocCheckingAppInterface } from "../types.js";
import { mockResponse, RequestOutput, ResponseOutput } from "mock-req-res";
import { PATH_NAMES } from "../../../app.constants.js";
import { docCheckingAppGet } from "../doc-checking-app-controller.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { strict as assert } from "assert";

describe("doc checking app controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.DOC_CHECKING_APP);
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("docCheckingAppGet", () => {
    it("should redirect to doc checking authorisation api", async () => {
      const fakeService: DocCheckingAppInterface = {
        docCheckingAppAuthorize: sinon.fake.returns({
          success: true,
          data: {
            redirectUri: "https://test-doc-checking-authorisation-uri.com",
          },
        }),
      } as unknown as DocCheckingAppInterface;

      await docCheckingAppGet(fakeService)(req as Request, res as Response);

      expect(req.session.user.journey.nextPath).to.equal(
        PATH_NAMES.DOC_CHECKING_APP_CALLBACK
      );
      expect(res.redirect).to.have.calledWith(
        "https://test-doc-checking-authorisation-uri.com"
      );
    });
    it("should throw error when bad API request", async () => {
      const fakeService: DocCheckingAppInterface = {
        docCheckingAppAuthorize: sinon.fake.returns({
          success: false,
          data: { code: "1222", message: "Error occurred" },
        }),
      } as unknown as DocCheckingAppInterface;

      await assert.rejects(
        async () =>
          docCheckingAppGet(fakeService)(req as Request, res as Response),
        Error,
        "1222:Error occurred"
      );
    });
  });
});
