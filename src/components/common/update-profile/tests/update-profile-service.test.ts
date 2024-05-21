import { describe } from "mocha";
import sinon, { SinonStub } from "sinon";
import { Http } from "../../../../utils/http";
import { UpdateProfileServiceInterface, UpdateType } from "../types";
import {
  checkApiCallMadeWithExpectedBodyAndHeaders,
  commonVariables,
  expectedHeadersFromCommonVarsWithoutSecurityHeaders,
  resetApiKeyAndBaseUrlEnvVars,
  setupApiKeyAndBaseUrlEnvVars,
} from "../../../../../test/helpers/service-test-helper";
import { API_ENDPOINTS, HTTP_STATUS_CODES } from "../../../../app.constants";
import { updateProfileService } from "../update-profile-service";

describe("update profile service", () => {
  const httpInstance = new Http();
  const service: UpdateProfileServiceInterface =
    updateProfileService(httpInstance);
  let postStub: SinonStub;

  beforeEach(() => {
    setupApiKeyAndBaseUrlEnvVars();
    postStub = sinon.stub(httpInstance.client, "post");
  });

  afterEach(() => {
    postStub.reset();
    resetApiKeyAndBaseUrlEnvVars();
  });

  it("successfully calls the API to update a profile", async () => {
    const axiosResponse = Promise.resolve({
      data: {},
      status: HTTP_STATUS_CODES.NO_CONTENT,
      statusText: "OK",
    });
    postStub.resolves(axiosResponse);
    const { sessionId, clientSessionId, email, ip, diPersistentSessionId } =
      commonVariables;
    const profileInformation = true;
    const updateProfileType = UpdateType.CAPTURE_CONSENT;

    const result = await service.updateProfile(
      sessionId,
      clientSessionId,
      email,
      { profileInformation, updateProfileType },
      ip,
      diPersistentSessionId
    );

    const expectedApiCallDetails = {
      expectedPath: API_ENDPOINTS.UPDATE_PROFILE,
      expectedHeaders: expectedHeadersFromCommonVarsWithoutSecurityHeaders,
      expectedBody: { email, profileInformation, updateProfileType },
    };

    checkApiCallMadeWithExpectedBodyAndHeaders(
      result,
      postStub,
      true,
      expectedApiCallDetails
    );
  });
});
