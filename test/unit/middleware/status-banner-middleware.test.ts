import { expect } from "chai";
import { describe } from "mocha";
import type { NextFunction, Request, Response } from "express";
import { mockRequest, mockResponse } from "mock-req-res";
import { sinon } from "../../utils/test-utils.js";
import { statusBannerMiddleware } from "../../../src/middleware/status-banner-middleware.js";
import { PATH_NAMES } from "../../../src/app.constants.js";

describe("status banner middleware", () => {
  let res: Partial<Response>;
  let next: NextFunction;

  function run(path: string) {
    const req = mockRequest({ path });
    statusBannerMiddleware(req as Request, res as Response, next);
  }

  beforeEach(() => {
    res = mockResponse();
    next = sinon.fake() as unknown as NextFunction;
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.STATUS_BANNER;
    delete process.env.STATUS_BANNER_SHOW_FROM;
    delete process.env.STATUS_BANNER_SHOW_UNTIL;
  });

  it("should show the banner on a page the scenario targets", () => {
    process.env.STATUS_BANNER = "sms-delays";

    run(PATH_NAMES.ENTER_MFA);

    expect(res.locals.statusBanners).to.deep.equal({
      notificationBannerKeyPrefixes: ["general.statusBanner.smsDelays"],
      warningTextKeyPrefixes: [],
    });
    expect(next).to.have.been.calledOnce;
  });

  it("should not show the banner on a page the scenario does not target", () => {
    process.env.STATUS_BANNER = "sms-delays";

    run(PATH_NAMES.ENTER_EMAIL_SIGN_IN);

    expect(res.locals).to.not.have.property("statusBanners");
    expect(next).to.have.been.calledOnce;
  });

  it("should show the banner on every page when the scenario targets all pages", () => {
    process.env.STATUS_BANNER = "service-issues";

    run(PATH_NAMES.ENTER_EMAIL_SIGN_IN);

    expect(res.locals.statusBanners).to.deep.equal({
      notificationBannerKeyPrefixes: [],
      warningTextKeyPrefixes: ["general.statusBanner.serviceIssues"],
    });
    expect(next).to.have.been.calledOnce;
  });

  it("should show every listed scenario that targets the page, in the order listed", () => {
    process.env.STATUS_BANNER =
      "password-reset-unavailable,email-delays,service-issues,sms-delays";

    run(PATH_NAMES.RESET_PASSWORD_2FA_SMS);

    expect(res.locals.statusBanners).to.deep.equal({
      notificationBannerKeyPrefixes: [
        "general.statusBanner.passwordResetUnavailable",
        "general.statusBanner.smsDelays",
      ],
      warningTextKeyPrefixes: ["general.statusBanner.serviceIssues"],
    });
    expect(next).to.have.been.calledOnce;
  });

  it("should still show valid scenarios when another listed scenario is unknown", () => {
    process.env.STATUS_BANNER = "sms-delayz,service-issues";

    run(PATH_NAMES.ENTER_MFA);

    expect(res.locals.statusBanners).to.deep.equal({
      notificationBannerKeyPrefixes: [],
      warningTextKeyPrefixes: ["general.statusBanner.serviceIssues"],
    });
    expect(next).to.have.been.calledOnce;
  });

  describe("showing times", () => {
    beforeEach(() => {
      process.env.STATUS_BANNER = "sms-delays,service-issues";
      process.env.STATUS_BANNER_SHOW_FROM = "2026-11-21T09:00Z";
      process.env.STATUS_BANNER_SHOW_UNTIL = "2026-11-21T17:00Z";
    });

    [
      { now: "2026-11-21T08:00Z", description: "before the start time" },
      { now: "2026-11-21T17:00Z", description: "from the end time" },
    ].forEach(({ now, description }) => {
      it(`should not show any banners ${description}`, () => {
        sinon.useFakeTimers({ now: new Date(now) });

        run(PATH_NAMES.ENTER_MFA);

        expect(res.locals).to.not.have.property("statusBanners");
      });
    });

    it("should show every listed banner between the start and end times", () => {
      sinon.useFakeTimers({ now: new Date("2026-11-21T12:00Z") });

      run(PATH_NAMES.ENTER_MFA);

      expect(res.locals.statusBanners).to.deep.equal({
        notificationBannerKeyPrefixes: ["general.statusBanner.smsDelays"],
        warningTextKeyPrefixes: ["general.statusBanner.serviceIssues"],
      });
    });

    it("should not show any banners when a time is invalid", () => {
      process.env.STATUS_BANNER_SHOW_UNTIL = "2026-11-21T17:00";
      sinon.useFakeTimers({ now: new Date("2026-11-21T12:00Z") });

      run(PATH_NAMES.ENTER_MFA);

      expect(res.locals).to.not.have.property("statusBanners");
      expect(next).to.have.been.calledOnce;
    });
  });

  it("should not show a banner when the scenario id is unknown", () => {
    process.env.STATUS_BANNER = "sms-delayz";

    run(PATH_NAMES.ENTER_MFA);

    expect(res.locals).to.not.have.property("statusBanners");
    expect(next).to.have.been.calledOnce;
  });

  it("should not show a banner when STATUS_BANNER is not set", () => {
    run(PATH_NAMES.ENTER_MFA);

    expect(res.locals).to.not.have.property("statusBanners");
    expect(next).to.have.been.calledOnce;
  });
});
