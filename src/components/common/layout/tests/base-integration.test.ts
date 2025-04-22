import { expect } from "chai";
import * as cheerio from "cheerio";
import decache from "decache";
import { describe } from "mocha";
import nock from "nock";
import request from "supertest";
import { sinon } from "../../../../../test/utils/test-utils";
import { CHANNEL, PATH_NAMES } from "../../../../app.constants";
import { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../../test/helpers/session-helper";
import { buildMfaMethods } from "../../../../../test/helpers/mfa-helper";

describe("Integration:: base page ", () => {
  let app: any;

  const setupApp = async (channel: string, showTestBanner?: boolean) => {
    decache("../../../../app");
    decache("../../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../../middleware/session-middleware");
    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (
        req: Request,
        res: Response,
        next: NextFunction
      ): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        if (channel === CHANNEL.WEB) {
          res.locals.webChannel = true;
        } else if (channel === CHANNEL.STRATEGIC_APP) {
          res.locals.strategicAppChannel = true;
        }

        req.session.client = {
          serviceType: "MANDATORY",
        };
        req.session.user = {
          email: "test@test.com",
          mfaMethods: buildMfaMethods({ phoneNumber: "7867" }),
          journey: getPermittedJourneyForPath(PATH_NAMES.SIGN_IN_OR_CREATE),
        };

        next();
      });
    if (showTestBanner !== undefined) {
      decache("../../../../middleware/environment-banner-middleware");
      const envBannerMiddleware = require("../../../../middleware/environment-banner-middleware");
      sinon
        .stub(envBannerMiddleware, "environmentBannerMiddleware")
        .callsFake(function (
          req: Request,
          res: Response,
          next: NextFunction
        ): void {
          res.locals.showTestBanner = showTestBanner;
          next();
        });
    }

    app = await require("../../../../app").createApp();
  };

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return the sign in or create page", async () => {
    await setupApp(CHANNEL.WEB);
    await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE).expect(200);
  });

  describe("Web channel", () => {
    let $: any;
    before(async () => {
      await setupApp(CHANNEL.WEB, true);
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      $ = cheerio.load(response.text);
    });

    it("should render the footer", async () => {
      expect($(".govuk-footer").length).to.equal(1);
    });

    describe("when in a non-production environment", () => {
      it("should render the test phase banner", async () => {
        expect($(".govuk-phase-banner").length).to.equal(1);
        expect($(".govuk-phase-banner").hasClass("test-banner")).to.be.true;
        expect($(".govuk-phase-banner__content__tag").text().trim()).to.equal(
          "test"
        );
      });
      it("should render the test phase header css", async () => {
        expect($("a.govuk-header__link").length).to.equal(1);
        expect($(".strategic-app-header").length).to.equal(0);
        expect($(".govuk-header").hasClass("test-banner")).to.be.true;
      });
    });

    describe("when in a production environment", () => {
      let $: any;
      before(async () => {
        await setupApp(CHANNEL.WEB, false);
        const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
        expect(response.status).to.equal(200);
        $ = cheerio.load(response.text);
      });
      it("should render the beta phase banner", async () => {
        expect($(".govuk-phase-banner").length).to.equal(1);
        expect($(".govuk-phase-banner").hasClass("test-banner")).to.be.false;
        expect($(".govuk-phase-banner__content__tag").text().trim()).to.equal(
          "beta"
        );
      });
      it("should not render the test phase header css", async () => {
        expect($(".govuk-header").hasClass("test-banner")).to.be.false;
        expect($(".strategic-app-header").length).to.equal(0);
        expect($("a.govuk-header__link").length).to.equal(1);
      });
    });
  });

  describe("Strategic App channel", () => {
    let $: any;
    before(async () => {
      await setupApp(CHANNEL.STRATEGIC_APP, true);
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      $ = cheerio.load(response.text);
    });

    it("should render the custom header with no links", async () => {
      expect($("a.govuk-header__link").length).to.equal(0);
      expect($(".strategic-app-header").length).to.equal(1);
    });

    it("should not render the footer", async () => {
      expect($(".govuk-footer").length).to.equal(0);
    });

    describe("when in a non-production environment", () => {
      it("should render the test phase header css", async () => {
        expect($(".govuk-header").hasClass("test-banner")).to.be.true;
      });
    });

    describe("when in a production environment", () => {
      let $: any;
      before(async () => {
        await setupApp(CHANNEL.STRATEGIC_APP, false);
        const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
        expect(response.status).to.equal(200);
        $ = cheerio.load(response.text);
      });

      it("should not render the test phase header css", async () => {
        expect($(".govuk-header").hasClass("test-banner")).to.be.false;
      });
    });
  });

  describe("Undefined channel", () => {
    it("should render the default header if no value is provided for channel", async () => {
      await setupApp("");
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.status).to.equal(200);
      const $ = cheerio.load(response.text);
      expect($("a.govuk-header__link").length).to.equal(1);
    });
  });

  describe("Cache-Control", () => {
    it("should not be cached", async () => {
      await setupApp("");
      const response = await request(app).get(PATH_NAMES.SIGN_IN_OR_CREATE);
      expect(response.header["cache-control"]).to.equal(
        "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
      );
    });
  });
});
