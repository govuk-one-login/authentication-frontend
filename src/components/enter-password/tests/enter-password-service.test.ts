import { describe } from "mocha";
import { enterPasswordService } from "../enter-password-service";
import { ApiResponseResult } from "../../../types";
import { EnterPasswordServiceInterface, UserLoginResponse } from "../types";
import { expect } from "chai";
import { Request } from "express";
import { Http } from "../../../utils/http";
import { sinon } from "../../../../test/utils/test-utils";
import { API_ENDPOINTS } from "../../../app.constants";
import { SinonStub } from "sinon";

describe("enter-password-service", () => {
  const httpInstance = new Http();
  const service: EnterPasswordServiceInterface =
    enterPasswordService(httpInstance);
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
    const axiosResponse = Promise.resolve({
      data: {},
      status: 200,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
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
        "111.111.111.111",
        "",
        undefined
      );

    expect(result.success).to.be.true;
    expect(result.data).to.deep.eq({});
    expect(
      postStub.calledOnceWithExactly(API_ENDPOINTS.LOG_IN_USER, expectedBody, {
        headers: {
          "X-Forwarded-For": "111.111.111.111",
          "X-API-Key": API_KEY,
        },
        proxy: sinon.match.bool,
        validateStatus: sinon.match.func,
      })
    ).to.be.true;
  });
});
