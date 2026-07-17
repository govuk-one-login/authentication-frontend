import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";
import * as cheerio from "cheerio";
import type { UserSession } from "../../../types.js";
import nock from "nock";
import { commonVariables } from "../../../../test/helpers/common-test-variables.js";
import { CANNOT_SIGN_IN_PASSKEY_ACTION } from "../types.js";

describe("Integration:: cannot sign in passkey", () => {
  let app: any;
  let baseApi: string;
  let capturedSession: UserSession;

  before(async () => {
    process.env.SUPPORT_PASSKEY_USAGE = "1";
    process.env.SUPPORT_PASSKEY_REGISTRATION = "1";

    const { createApp } = await esmock(
      "../../../app.js",
      {},
      {
        "../../../middleware/session-middleware.js": {
          validateSessionMiddleware: sinon.fake(function (
            req: Request,
            res: Response,
            next: NextFunction
          ): void {
            res.locals.sessionId = commonVariables.sessionId;
            res.locals.clientSessionId = commonVariables.clientSessionId;
            res.locals.persistentSessionId =
              commonVariables.diPersistentSessionId;

            req.session.user = {
              ...req.session.user,
              journey: getPermittedJourneyForPath(
                PATH_NAMES.CANNOT_SIGN_IN_PASSKEY
              ),
            };

            capturedSession = req.session.user;

            next();
          }),
        },
      }
    );

    baseApi = process.env.FRONTEND_API_BASE_URL as string;

    app = await createApp();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  describe("GET /cannot-sign-in-passkey", () => {
    it("should return the cannot sign in passkey page", async () => {
      const startPasskeyAssertionResponse = {
        publicKey: {
          challenge: "challenge",
          rpId: "localhost",
          allowCredentials: [{ type: "public-key", id: "credential-id-123" }],
          timeout: 60000,
          userVerification: "preferred",
        },
      };
      nock(baseApi)
        .post(API_ENDPOINTS.START_PASSKEY_ASSERTION)
        .once()
        .reply(200, startPasskeyAssertionResponse);

      const res = await request(app)
        .get(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
        .expect(200);

      expectDataAuthenticationOptionsToBeRendered(
        startPasskeyAssertionResponse.publicKey,
        res.text
      );
    });
  });

  describe("POST /cannot-sign-in-passkey", () => {
    let token: string;
    let cookies: string;
    const fakeStartPasskeyAssertionOptions = {
      publicKey: {
        challenge: "test",
        rpId: "localhost",
      },
    };

    before(async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.START_PASSKEY_ASSERTION)
        .once()
        .reply(200, fakeStartPasskeyAssertionOptions);

      ({ token, cookies } = extractCsrfTokenAndCookies(
        await request(app).get(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
      ));
    });

    describe("success", () => {
      it("should redirect to auth-code when passkey successfully retried", async () => {
        nock(baseApi)
          .post(API_ENDPOINTS.FINISH_PASSKEY_ASSERTION)
          .once()
          .reply(200, { message: "success", code: 0 });

        await request(app)
          .post(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
          .type("form")
          .set("Cookie", cookies)
          .send({
            _csrf: token,
            authenticationResponse: commonVariables.passkeyAssertionResponse,
            "cannot-sign-in-passkey-action":
              CANNOT_SIGN_IN_PASSKEY_ACTION.RETRY_PASSKEY,
          })
          .expect(302)
          .expect("Location", PATH_NAMES.AUTH_CODE);
      });

      it("should redirect to enter-password and save cannot-sign-in-passkey in goBackHistory when user selects sign in without passkey option", async () => {
        await request(app)
          .post(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
          .type("form")
          .set("Cookie", cookies)
          .send({
            _csrf: token,
            authenticationResponse: commonVariables.passkeyAssertionResponse,
            "cannot-sign-in-passkey-action":
              CANNOT_SIGN_IN_PASSKEY_ACTION.SIGN_IN_WITHOUT_PASSKEY,
          })
          .expect(302)
          .expect("Location", PATH_NAMES.ENTER_PASSWORD);

        expect(capturedSession.journey.goBackHistory).to.deep.equal([
          PATH_NAMES.CANNOT_SIGN_IN_PASSKEY,
        ]);
      });
    });

    describe("failure", () => {
      it("should return error when csrf not present", async () => {
        nock(baseApi)
          .post(API_ENDPOINTS.FINISH_PASSKEY_ASSERTION)
          .once()
          .reply(200, { message: "success", code: 0 });

        await request(app)
          .post(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
          .type("form")
          .set("Cookie", cookies)
          .send({
            authenticationResponse: commonVariables.passkeyAssertionResponse,
            "cannot-sign-in-passkey-action":
              CANNOT_SIGN_IN_PASSKEY_ACTION.RETRY_PASSKEY,
          })
          .expect(403);
      });

      it("should redirect to cannot-sign-in-passkey when parsing pkc error", async () => {
        nock(baseApi)
          .post(API_ENDPOINTS.FINISH_PASSKEY_ASSERTION)
          .once()
          .reply(400, { success: false, code: 0 });

        await request(app)
          .post(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
          .type("form")
          .set("Cookie", cookies)
          .send({
            _csrf: token,
            authenticationResponse: commonVariables.passkeyAssertionResponse,
            "cannot-sign-in-passkey-action":
              CANNOT_SIGN_IN_PASSKEY_ACTION.RETRY_PASSKEY,
          })
          .expect(302)
          .expect("Location", PATH_NAMES.CANNOT_SIGN_IN_PASSKEY);
      });

      it("should redirect to cannot-sign-in-passkey when finish assertion fails", async () => {
        nock(baseApi)
          .post(API_ENDPOINTS.FINISH_PASSKEY_ASSERTION)
          .once()
          .reply(401, { success: false, code: 0 });

        await request(app)
          .post(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
          .type("form")
          .set("Cookie", cookies)
          .send({
            _csrf: token,
            authenticationResponse: commonVariables.passkeyAssertionResponse,
            "cannot-sign-in-passkey-action":
              CANNOT_SIGN_IN_PASSKEY_ACTION.RETRY_PASSKEY,
          })
          .expect(302)
          .expect("Location", PATH_NAMES.CANNOT_SIGN_IN_PASSKEY);
      });

      it("should return a validation error when no option is selected", async () => {
        const res = await request(app)
          .post(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
          .type("form")
          .set("Cookie", cookies)
          .send({
            _csrf: token,
            authenticationResponse: commonVariables.passkeyAssertionResponse,
          })
          .expect(function (res) {
            const $ = cheerio.load(res.text);
            expect(
              $("#cannot-sign-in-passkey-action-error").text()
            ).to.contains("Select what you would like to do");
          })
          .expect(400);

        expectDataAuthenticationOptionsToBeRendered(
          fakeStartPasskeyAssertionOptions.publicKey,
          res.text
        );
      });

      it("should redirect to cannot-sign-in-passkey with passkeySignInWebauthnError query param when authenticationError exists", async () => {
        await request(app)
          .post(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
          .type("form")
          .set("Cookie", cookies)
          .send({
            _csrf: token,
            authenticationError: "NotAllowedError",
            "cannot-sign-in-passkey-action":
              CANNOT_SIGN_IN_PASSKEY_ACTION.RETRY_PASSKEY,
          })
          .expect(302)
          .expect(
            "Location",
            `${PATH_NAMES.CANNOT_SIGN_IN_PASSKEY}?passkeySignInWebauthnError=NotAllowedError`
          );
      });
    });
  });
});

function expectDataAuthenticationOptionsToBeRendered(
  expectedOptions: object,
  resText: string
) {
  const $ = cheerio.load(resText);
  const options = $("#cannotSignInPasskeyForm").attr(
    "data-authentication-options"
  );
  expect(options).to.equal(JSON.stringify(expectedOptions));
}
