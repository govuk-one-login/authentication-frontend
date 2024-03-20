import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { rpAuthCodeService } from "../rp-auth-code-service";
import { SinonStub } from "sinon";
import { API_ENDPOINTS } from "../../../app.constants";
import { RpAuthCodeServiceInterface } from "../types";
import { Http } from "../../../utils/http";

describe("authentication auth code service", () => {
  const redirectUriReturnedFromResponse =
    "/redirect-here?with-some-params=added-by-the-endpoint";
  const apiBaseUrl = "/base-url";

  const axiosResponse = Promise.resolve({
    data: {
      location: redirectUriReturnedFromResponse,
    },
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  });
  let getStub: SinonStub;
  let service: RpAuthCodeServiceInterface;

  beforeEach(() => {
    process.env.API_KEY = "api-key";
    process.env.API_BASE_URL = apiBaseUrl;
    const httpInstance = new Http();
    service = rpAuthCodeService(httpInstance);
    getStub = sinon.stub(httpInstance.client, "get");
    getStub.resolves(axiosResponse);
  });

  afterEach(() => {
    getStub.reset();
  });

  it("it should make a get request to the auth code endpoint with no body", async () => {
    process.env.SUPPORT_AUTH_ORCH_SPLIT = "0";

    const result = await service.getAuthCode(
      "sessionId",
      "clientSessionId",
      "sourceIp",
      "persistentSessionId"
    );

    expect(
      getStub.calledOnceWithExactly(API_ENDPOINTS.AUTH_CODE, {
        headers: sinon.match.object,
        baseURL: apiBaseUrl,
        proxy: sinon.match.bool,
      })
    ).to.be.true;
    expect(result.data.location).to.deep.eq(redirectUriReturnedFromResponse);
  });
});
