import { describe } from "mocha";
import { enterPasswordService } from "../enter-password-service.js";
import type { ApiResponseResult } from "../../../types.js";
import type {
  EnterPasswordServiceInterface,
  UserLoginResponse,
} from "../types.js";
import { expect } from "chai";
import type { Request } from "express";
import { Http } from "../../../utils/http.js";
import { sinon } from "../../../../test/utils/test-utils.js";
import { API_ENDPOINTS } from "../../../app.constants.js";
import { createMockRequest } from "../../../../test/helpers/mock-request-helper.js";
import type { SinonStub } from "sinon";

describe("enter-password-service", () => {
  let req: Partial<Request>;
  const httpInstance = new Http();
  const service: EnterPasswordServiceInterface =
    enterPasswordService(httpInstance);
  const IP_ADDRESS = "123.123.123.123";
  const API_KEY = "api-key";

  let postStub: SinonStub;

  beforeEach(() => {
    process.env.API_KEY = API_KEY;
    process.env.FRONTEND_API_BASE_URL = "https://gov.uk";
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    delete process.env.API_KEY;
    delete process.env.FRONTEND_API_BASE_URL;
  });

  it("successfully calls the API to log the user in or reauthenticate", async () => {
    const auditEncodedString =
      "R21vLmd3QilNKHJsaGkvTFxhZDZrKF44SStoLFsieG0oSUY3aEhWRVtOMFRNMVw1dyInKzB8OVV5N09hOi8kLmlLcWJjJGQiK1NPUEJPPHBrYWJHP358NDg2ZDVc";
    const axiosResponse = Promise.resolve({
      data: {},
      status: 200,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    req = createMockRequest(API_ENDPOINTS.LOG_IN_USER);
    req.ip = IP_ADDRESS;
    req.headers = {
      "txma-audit-encoded": auditEncodedString,
      "x-forwarded-for": IP_ADDRESS,
    };
    const expectedBody = {
      email: "email",
      password: "password",
    };

    const result: ApiResponseResult<UserLoginResponse> =
      await service.loginUser(
        "",
        "email",
        "password",
        "",
        "",
        req as Request,
        undefined
      );

    expect(result.success).to.be.true;
    expect(result.data).to.deep.eq({});
    expect(
      postStub.calledOnceWithExactly(API_ENDPOINTS.LOG_IN_USER, expectedBody, {
        headers: {
          "txma-audit-encoded": auditEncodedString,
          "x-forwarded-for": IP_ADDRESS,
          "X-API-Key": API_KEY,
        },
        proxy: sinon.match.bool,
        validateStatus: sinon.match.func,
      })
    ).to.be.true;
  });
});
