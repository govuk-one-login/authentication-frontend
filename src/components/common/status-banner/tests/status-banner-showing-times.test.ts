import { expect } from "chai";
import { describe, it } from "mocha";
import {
  isShowingAt,
  parseStatusBannerShowingTimes,
} from "../status-banner-showing-times.js";

describe("status banner showing times", () => {
  describe("parseStatusBannerShowingTimes", () => {
    it("should have no times or problems when neither is set", () => {
      expect(parseStatusBannerShowingTimes(undefined, undefined)).to.deep.equal(
        { problems: [] }
      );
    });

    it("should read a start and end time", () => {
      expect(
        parseStatusBannerShowingTimes(
          "2026-11-21T09:00Z",
          "2026-11-21T17:30:00+01:00"
        )
      ).to.deep.equal({
        showFrom: new Date("2026-11-21T09:00Z"),
        showUntil: new Date("2026-11-21T16:30Z"),
        problems: [],
      });
    });

    it("should read a start time on its own", () => {
      expect(
        parseStatusBannerShowingTimes("2026-11-21T09:00Z", undefined)
      ).to.deep.equal({
        showFrom: new Date("2026-11-21T09:00Z"),
        problems: [],
      });
    });

    it("should read an end time on its own", () => {
      expect(
        parseStatusBannerShowingTimes(undefined, "2026-11-21T17:00Z")
      ).to.deep.equal({
        showUntil: new Date("2026-11-21T17:00Z"),
        problems: [],
      });
    });

    [
      {
        showFrom: "2026-11-21T09:00",
        showUntil: undefined,
        problem:
          "STATUS_BANNER_SHOW_FROM '2026-11-21T09:00' must be written with a time zone",
      },
      {
        showFrom: undefined,
        showUntil: "21-11-2026 17:00Z",
        problem:
          "STATUS_BANNER_SHOW_UNTIL '21-11-2026 17:00Z' must be written with a time zone",
      },
      {
        showFrom: "2026-11-21T17:00Z",
        showUntil: "2026-11-21T09:00Z",
        problem:
          "STATUS_BANNER_SHOW_FROM must be before STATUS_BANNER_SHOW_UNTIL",
      },
    ].forEach(({ showFrom, showUntil, problem }) => {
      it(`should report a problem for '${showFrom}' to '${showUntil}'`, () => {
        const { problems } = parseStatusBannerShowingTimes(showFrom, showUntil);

        expect(problems).to.have.length(1);
        expect(problems[0]).to.contain(problem);
      });
    });
  });

  describe("isShowingAt", () => {
    const showingTimes = parseStatusBannerShowingTimes(
      "2026-11-21T09:00Z",
      "2026-11-21T17:00Z"
    );

    [
      { now: "2026-11-21T08:59:59Z", expected: false },
      { now: "2026-11-21T09:00:00Z", expected: true },
      { now: "2026-11-21T16:59:59Z", expected: true },
      { now: "2026-11-21T17:00:00Z", expected: false },
    ].forEach(({ now, expected }) => {
      it(`should return ${expected} at ${now}`, () => {
        expect(isShowingAt(showingTimes, new Date(now))).to.equal(expected);
      });
    });

    it("should always show when no times are set", () => {
      expect(
        isShowingAt(
          parseStatusBannerShowingTimes(undefined, undefined),
          new Date("2000-01-01T00:00Z")
        )
      ).to.be.true;
    });

    it("should not show when the times are invalid", () => {
      expect(
        isShowingAt(
          parseStatusBannerShowingTimes("not-a-time", undefined),
          new Date("2026-11-21T12:00Z")
        )
      ).to.be.false;
    });
  });
});
