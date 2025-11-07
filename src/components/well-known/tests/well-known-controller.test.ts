import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import type { RequestOutput, ResponseOutput } from "mock-req-res";
import { mockResponse } from "mock-req-res";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import { appleAppSiteAssociationGet } from "../well-known-controller.js";
import { APP_ENV_NAME, PATH_NAMES } from "../../../app.constants.js";

describe("well-known controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;
  let originalAppEnv: string | undefined;

  beforeEach(() => {
    req = createMockRequest(PATH_NAMES.WELL_KNOWN_APPLE_ASSOCIATION);
    res = mockResponse();
    originalAppEnv = process.env.APP_ENV;
  });

  afterEach(() => {
    sinon.restore();
    process.env.APP_ENV = originalAppEnv;
  });

  describe("appleAppSiteAssociationGet", () => {
    it("should return 404 in PROD environment", () => {
      process.env.APP_ENV = APP_ENV_NAME.PROD;

      appleAppSiteAssociationGet(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.send).to.have.been.called;
    });

    it("should return 404 in INT environment", () => {
      process.env.APP_ENV = APP_ENV_NAME.INT;

      appleAppSiteAssociationGet(req, res);

      expect(res.status).to.have.been.calledWith(404);
      expect(res.send).to.have.been.called;
    });

    it("should return JSON response in other environments", () => {
      process.env.APP_ENV = APP_ENV_NAME.STAGING;

      appleAppSiteAssociationGet(req, res);

      expect(res.setHeader).to.have.been.calledWith(
        "Content-Type",
        "application/json"
      );
      expect(res.json).to.have.been.calledWith({
        applinks: {
          apps: [],
          details: [],
        },
        webcredentials: {
          apps: ["N8W395F695.uk.gov.govuk.dev", "N8W395F695.uk.gov.govuk"],
        },
      });
    });
  });
});
