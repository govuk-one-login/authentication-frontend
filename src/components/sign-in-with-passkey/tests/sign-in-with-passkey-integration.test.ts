import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import nock from "nock";
import * as cheerio from "cheerio";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";

describe("Integration:: sign in with passkey", () => {
  let app: any;
  let baseApi: string;

  before(async () => {
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
            res.locals.sessionId = "test-session-id";
            res.locals.clientSessionId = "test-client-session-id";
            res.locals.persistentSessionId = "test-persistent-session-id";

            req.session.user = {
              journey: getPermittedJourneyForPath(
                PATH_NAMES.SIGN_IN_WITH_PASSKEY
              ),
            };

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

  describe("GET /sign-in-passkey", () => {
    it("should return sign in with passkey page", async () => {
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
        .get(PATH_NAMES.SIGN_IN_WITH_PASSKEY)
        .expect(200);
      const $ = cheerio.load(res.text);
      const options = $("#signInWithPasskeyForm").attr(
        "data-authentication-options"
      );
      expect(options).to.equal(
        JSON.stringify(startPasskeyAssertionResponse.publicKey)
      );
    });
  });

  describe("POST /sign-in-passkey - success", () => {
    it("should redirect on successful passkey finish assertion", async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.START_PASSKEY_ASSERTION)
        .once()
        .reply(200, { challenge: "test", rpId: "localhost" });

      const { token, cookies } = extractCsrfTokenAndCookies(
        await request(app).get(PATH_NAMES.SIGN_IN_WITH_PASSKEY)
      );

      nock(baseApi)
        .post(API_ENDPOINTS.FINISH_PASSKEY_ASSERTION)
        .once()
        .reply(200, { message: "success", code: 0 });

      await request(app)
        .post(PATH_NAMES.SIGN_IN_WITH_PASSKEY)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          authenticationResponse: JSON.stringify({
            id: "credential-id",
            rawId: "credential-id",
            response: {
              authenticatorData: "base64data",
              clientDataJSON: "base64data",
              signature: "base64sig",
            },
            type: "public-key",
            authenticatorAttachment: "platform",
          }),
        })
        .expect(302)
        .expect("Location", PATH_NAMES.AUTH_CODE);
    });
  });

  describe("POST /sign-in-passkey - failure", () => {
    it("should redirect to cannot sign in passkey when authenticationError is present", async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.START_PASSKEY_ASSERTION)
        .once()
        .reply(200, { challenge: "test", rpId: "localhost" });

      const { token, cookies } = extractCsrfTokenAndCookies(
        await request(app).get(PATH_NAMES.SIGN_IN_WITH_PASSKEY)
      );

      await request(app)
        .post(PATH_NAMES.SIGN_IN_WITH_PASSKEY)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          authenticationError: "NotAllowedError",
        })
        .expect(302)
        .expect("Location", PATH_NAMES.CANNOT_SIGN_IN_PASSKEY);
    });

    it("should redirect to cannot sign in passkey when finish assertion fails", async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.START_PASSKEY_ASSERTION)
        .once()
        .reply(200, { challenge: "test", rpId: "localhost" });

      const { token, cookies } = extractCsrfTokenAndCookies(
        await request(app).get(PATH_NAMES.SIGN_IN_WITH_PASSKEY)
      );

      nock(baseApi)
        .post(API_ENDPOINTS.FINISH_PASSKEY_ASSERTION)
        .once()
        .reply(400, { message: "Assertion failed", code: 1000 });

      await request(app)
        .post(PATH_NAMES.SIGN_IN_WITH_PASSKEY)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          authenticationResponse: JSON.stringify({
            id: "credential-id",
            rawId: "credential-id",
            response: {
              authenticatorData: "base64data",
              clientDataJSON: "base64data",
              signature: "base64sig",
            },
            type: "public-key",
            authenticatorAttachment: "platform",
          }),
        })
        .expect(302)
        .expect("Location", PATH_NAMES.CANNOT_SIGN_IN_PASSKEY);
    });
  });
});
