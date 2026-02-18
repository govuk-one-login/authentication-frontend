import { describe } from "mocha";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";

describe("Integration:: change-security-codes-sign-in", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;

  before(async () => {
    const { createApp } = await esmock(
      "../../../app.js",
      {},
      {
        "../../../config.js": {
          getSessionSecret: () => "test-session-secret",
        },
      }
    );

    app = await createApp();
  });

  after(() => {
    app = undefined;
  });

  describe("GET /change-security-codes-sign-in", () => {
    it("should return 200 and render the page", async () => {
      await request(app)
        .get(PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN)
        .expect(200);
    });
  });

  describe("POST /change-security-codes-sign-in", () => {
    it("should return 200", async () => {
      ({ token, cookies } = extractCsrfTokenAndCookies(
        await request(app).get(PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN)
      ));

      await request(app)
        .post(PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(200);
    });
  });
});
