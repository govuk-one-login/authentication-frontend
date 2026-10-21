import { expect } from "../../test/utils/test-utils.js";
import type { Profiler } from "node:inspector";
import { msUntilNextCapture, summariseProfile } from "./pause-profiler.js";

describe("pause-profiler", () => {
  describe("msUntilNextCapture", () => {
    it("waits until second 58 of the current minute", () => {
      expect(msUntilNextCapture(new Date("2026-10-19T10:00:10.000Z"))).to.equal(
        48000
      );
    });

    it("waits until second 58 of the next minute once it has passed", () => {
      expect(msUntilNextCapture(new Date("2026-10-19T10:00:59.000Z"))).to.equal(
        59000
      );
    });
  });

  describe("summariseProfile", () => {
    it("returns the functions that used the most time first and skips unknown samples", () => {
      const profile: Profiler.Profile = {
        nodes: [
          {
            id: 1,
            callFrame: {
              functionName: "(idle)",
              scriptId: "0",
              url: "",
              lineNumber: -1,
              columnNumber: -1,
            },
          },
          {
            id: 2,
            callFrame: {
              functionName: "render",
              scriptId: "1",
              url: "file:///app/dist/app.js",
              lineNumber: 9,
              columnNumber: 0,
            },
          },
        ],
        startTime: 0,
        endTime: 4000,
        samples: [2, 3, 1, 2],
        timeDeltas: [0, 1000, 4000, 3000],
      };

      expect(summariseProfile(profile, 2)).to.deep.equal([
        { fn: "(idle)", ms: 3 },
        { fn: "render file:///app/dist/app.js:10", ms: 1 },
      ]);
    });
  });
});
