import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";
import * as cheerio from "cheerio";

describe("Integration:: cannot sign in passkey", () => {
  let app: any;

  before(async () => {
    process.env.SUPPORT_PASSKEY_USAGE = "1";

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
            req.session.user = {
              journey: getPermittedJourneyForPath(
                PATH_NAMES.CANNOT_SIGN_IN_PASSKEY
              ),
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  describe("GET /cannot-sign-in-passkey", () => {
    it("should return the cannot sign in passkey page", async () => {
      await request(app).get(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY).expect(200);
    });
  });

  describe("POST /cannot-sign-in-passkey", () => {
    it("should return error when csrf not present", async () => {
      await request(app)
        .post(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
        .type("form")
        .send({
          "cannot-sign-in-passkey-action": "retry-passkey",
        })
        .expect(403);
    });

    it("should return a validation error when no option is selected", async () => {
      const { token, cookies } = extractCsrfTokenAndCookies(
        await request(app).get(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
      );

      await request(app)
        .post(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#cannot-sign-in-passkey-action-error").text()).to.contains(
            "Select what you would like to do"
          );
        })
        .expect(400);
    });
  });
});
