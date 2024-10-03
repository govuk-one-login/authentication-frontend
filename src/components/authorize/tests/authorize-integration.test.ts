import { describe } from "mocha";
import { sinon, request } from "../../../../test/utils/test-utils";
import nock = require("nock");
import decache from "decache";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants";
import {
  AuthorizeServiceInterface,
  JwtServiceInterface,
  KmsDecryptionServiceInterface,
  StartAuthResponse,
} from "../types";
import { createApiResponse } from "../../../utils/http";
import { AxiosResponse } from "axios";
import {
  createJwt,
  createmockclaims,
  getPrivateKey,
  getPublicKey,
} from "./test-data";
import { JwtService } from "../jwt-service";
import { getOrchToAuthExpectedClientId } from "../../../config";

describe("Integration:: authorize", () => {
  let app: any;

  before(async () => {
    process.env.SUPPORT_AUTHORIZE_CONTROLLER = "1";
    decache("../../../app");
    decache("../authorize-service");
    decache("../kms-decryption-service");
    decache("../jwt-service");
    const authorizeService = require("../authorize-service");
    const KmsDecryptionService = require("../kms-decryption-service");
    const jwtService = require("../jwt-service");
    const publicKey = getPublicKey();
    const privateKey = await getPrivateKey();
    const jwt = await createJwt(createmockclaims(), privateKey);

    sinon
      .stub(authorizeService, "authorizeService")
      .callsFake((): AuthorizeServiceInterface => {
        async function start() {
          const fakeAxiosResponse: AxiosResponse = {
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
              },
            },
            status: HTTP_STATUS_CODES.OK,
          } as AxiosResponse;

          return createApiResponse<StartAuthResponse>(fakeAxiosResponse);
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

    app = await require("../../../app").createApp();
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
});
