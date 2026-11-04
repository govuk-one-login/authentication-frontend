import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import {
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import type express from "express";
import * as cheerio from "cheerio";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";
import request from "supertest";

const REQUEST_PATH = PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY;
const VALIDATION_ERROR = "You must select an option to continue";

describe("Integration:: cannot change security codes no identity", () => {
  afterEach(() => {
    sinon.restore();
    delete process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION;
  });

  describe("when self-serve account deletion is supported", () => {
    let app: express.Application;

    beforeEach(async () => {
      process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION = "1";
      app = await stubMiddlewareAndCreateApp(MFA_METHOD_TYPE.SMS);
    });

    it("should render the page", async () => {
      await request(app)
        .get(REQUEST_PATH)
        .expect(200)
        .then((res) => {
          const $ = cheerio.load(res.text);
          expect($("h1").text()).to.contain(
            "You cannot change how you get security codes"
          );
          expect($("legend").text()).to.contain("Choose an option");
          expect(
            $("input[name='cannotChangeHowGetSecurityCodeAction']")
              .map((_, el) => $(el).val())
              .get()
          ).to.deep.equal([
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.INITIATE_SELF_SERVE_ACCOUNT_DELETION,
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE,
          ]);
        });
    });

    it("should return a validation error in the field and the error summary when no option is selected", async () => {
      const { token, cookies } = await getTokenAndCookies(app);

      await request(app)
        .post(REQUEST_PATH)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token })
        .expect(400)
        .expect((res) => {
          const $ = cheerio.load(res.text);
          expect(
            $("#cannotChangeHowGetSecurityCodeAction-error").text()
          ).to.contain(VALIDATION_ERROR);
          expect($(".govuk-error-summary__list").text()).to.contain(
            VALIDATION_ERROR
          );
        });
    });

    it("should return a validation error when an option from another page is submitted", async () => {
      const { token, cookies } = await getTokenAndCookies(app);

      await request(app)
        .post(REQUEST_PATH)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.HELP_DELETE_ACCOUNT,
        })
        .expect(400)
        .expect((res) => {
          const $ = cheerio.load(res.text);
          expect(
            $("#cannotChangeHowGetSecurityCodeAction-error").text()
          ).to.contain(VALIDATION_ERROR);
        });
    });

    it("should redirect to ssad authorize when the user cannot use their current method", async () => {
      const { token, cookies } = await getTokenAndCookies(app);

      await request(app)
        .post(REQUEST_PATH)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.INITIATE_SELF_SERVE_ACCOUNT_DELETION,
        })
        .expect(302)
        .expect("Location", PATH_NAMES.SSAD_AUTHORIZE);
    });

    it("should redirect to /enter-code when an SMS user tries their current method again", async () => {
      const { token, cookies } = await getTokenAndCookies(app);

      await request(app)
        .post(REQUEST_PATH)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE,
        })
        .expect(302)
        .expect("Location", PATH_NAMES.ENTER_MFA);
    });
  });

  describe("when self-serve account deletion is not supported", () => {
    it("should return 404", async () => {
      process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION = "0";
      const app = await stubMiddlewareAndCreateApp(MFA_METHOD_TYPE.SMS);

      await request(app).get(REQUEST_PATH).expect(404);
    });
  });
});

const stubMiddlewareAndCreateApp = async (
  mfaMethodType: MFA_METHOD_TYPE
): Promise<express.Application> => {
  const { createApp } = await esmock(
    "../../../app.js",
    {},
    {
      "../../../config.js": {
        getSessionSecret: () => "test-session-secret",
      },
      "../../../middleware/session-middleware.js": {
        validateSessionMiddleware: sinon.fake(function (
          req: Request,
          res: Response,
          next: NextFunction
        ): void {
          res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

          req.session.user = {
            email: "test@test.com",
            journey: getPermittedJourneyForPath(REQUEST_PATH),
            mfaMethodType: mfaMethodType,
            isMfaRequired: true,
          };

          next();
        }),
      },
    }
  );

  return await createApp();
};

const getTokenAndCookies = async (app: express.Application) => {
  return extractCsrfTokenAndCookies(await request(app).get(REQUEST_PATH));
};
