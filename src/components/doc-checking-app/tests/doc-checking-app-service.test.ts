import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../test/helpers/service-test-helper";
import { Http } from "../../../utils/http";
import { DocCheckingAppInterface } from "../types";
import { docCheckingAppService } from "../doc-checking-app-service";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../app.constants";

describe("mfa service", () => {
  const httpInstance = new Http();
  const service: DocCheckingAppInterface = docCheckingAppService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to make a doc checking app request", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.OK,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { sessionId, clientSessionId, ip, diPersistentSessionId } =
      commonVariables;

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.DOC_CHECKING_APP_AUTHORIZE,
      expectedHeaders: expectedHeadersFromCommonVarsWithoutSecurityHeaders,
      expectedBody: {},
    };

    const result = await service.docCheckingAppAuthorize(
      sessionId,
      clientSessionId,
      ip,
      diPersistentSessionId
    );

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
