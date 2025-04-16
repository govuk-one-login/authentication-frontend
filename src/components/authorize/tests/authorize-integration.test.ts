import { describe } from "mocha";
import { sinon, request } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import decache from "decache";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import type {
  AuthorizeServiceInterface,
  JwtServiceInterface,
  KmsDecryptionServiceInterface,
  StartAuthResponse,
} from "../types.js";
import { createApiResponse } from "../../../utils/http.js";
import type { AxiosResponse } from "axios";
import {
  createJwt,
  createMockClaims,
  getPrivateKey,
  getPublicKey,
} from "./test-data.js";
import { JwtService } from "../jwt-service.js";
import { getOrchToAuthExpectedClientId } from "../../../config.js";
describe("Integration:: authorize", () => {
  let app: any;
  let userCookieConsent = false;

  beforeEach(async () => {
    process.env.SUPPORT_AUTHORIZE_CONTROLLER = "1";
    decache("../../../app");
    decache("../authorize-service");
    decache("../kms-decryption-service");
    decache("../jwt-service");
    const authorizeService = await import("../authorize-service.js");
    const KmsDecryptionService = await import("../kms-decryption-service.js");
    const jwtService = await import("../jwt-service.js");
    const publicKey = getPublicKey();
    const privateKey = await getPrivateKey();
    const jwt = await createJwt(createMockClaims(), privateKey);

    sinon
      .stub(authorizeService, "authorizeService")
      .callsFake((): AuthorizeServiceInterface => {
        async function start() {
          return createApiResponse<StartAuthResponse>(
            fakeAxiosStartResponse(userCookieConsent)
          );
        }

        return { start };
      });

    sinon
      .stub(KmsDecryptionService, "KmsDecryptionService")
      .callsFake((): KmsDecryptionServiceInterface => {
        async function decrypt() {
          return Promise.resolve(jwt);
        }
        return { decrypt };
      });

    sinon.stub(jwtService, "JwtService").callsFake((): JwtServiceInterface => {
      return new JwtService(publicKey);
    });

    app = await (await import("../../../app.js")).createApp();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should redirect to /sign-in-or-create", async () => {
    await request(app, (test) =>
      test
        .get(PATH_NAMES.AUTHORIZE)
        .query({
          client_id: getOrchToAuthExpectedClientId(),
          response_type: "code",
          request: "SomeJWE",
        })
        .expect("Location", PATH_NAMES.SIGN_IN_OR_CREATE)
        .expect(302)
    );
  });

  it("should redirect to /sign-in-or-create if user cookie consent is true", async () => {
    userCookieConsent = true;
    await request(app, (test) =>
      test
        .get(PATH_NAMES.AUTHORIZE)
        .query({
          client_id: getOrchToAuthExpectedClientId(),
          response_type: "code",
          request: "SomeJWE",
        })
        .expect("Location", PATH_NAMES.SIGN_IN_OR_CREATE)
        .expect(302)
    );
  });

  it("should redirect to /sign-in-or-create with Google Analytics tag if 'result' query exists", async () => {
    await request(app, (test) =>
      test
        .get(PATH_NAMES.AUTHORIZE)
        .query({
          client_id: getOrchToAuthExpectedClientId(),
          response_type: "code",
          request: "SomeJWE",
          result: "test-result",
        })
        .expect(
          "Location",
          PATH_NAMES.SIGN_IN_OR_CREATE + "?result=test-result"
        )
        .expect(302)
    );
  });

  function fakeAxiosStartResponse(userCookieConsent: boolean): AxiosResponse {
    return {
      data: {
        client: {
          serviceType: "MANDATORY",
          clientName: "test-client",
          cookieConsentEnabled: true,
          redirectUri: "http://test-redirect.gov.uk/callback",
          state: "jasldasl12312",
          isOneLoginService: false,
        },
        user: {
          upliftRequired: false,
          identityRequired: false,
          authenticated: false,
          cookieConsent: userCookieConsent ? "accept" : "reject",
        },
      },
      status: HTTP_STATUS_CODES.OK,
    } as AxiosResponse;
  }
});
