import { describe } from "mocha";
import { constants } from "node:perf_hooks";
import esmock from "esmock";
import { expect, sinon } from "../../test/utils/test-utils.js";

describe("startGcPauseLogging", () => {
  let warnStub: sinon.SinonStub;
  let observeStub: sinon.SinonStub;
  let disconnectStub: sinon.SinonStub;
  let gcCallback: (list: { getEntries: () => unknown[] }) => void;
  let startGcPauseLogging: () => () => void;

  beforeEach(async () => {
    warnStub = sinon.stub();
    observeStub = sinon.stub();
    disconnectStub = sinon.stub();

    class FakePerformanceObserver {
      constructor(callback: typeof gcCallback) {
        gcCallback = callback;
      }
      observe = observeStub;
      disconnect = disconnectStub;
    }

    ({ startGcPauseLogging } = await esmock("./gc-pause-logging.js", {
      "./logger.js": { logger: { warn: warnStub } },
      "node:perf_hooks": {
        PerformanceObserver: FakePerformanceObserver,
        constants,
      },
    }));
  });

  afterEach(() => {
    sinon.restore();
  });

  it("should observe garbage collection entries", () => {
    startGcPauseLogging();

    expect(observeStub).to.have.been.calledOnceWith({ entryTypes: ["gc"] });
  });

  it("should log a garbage collection pause of 50ms or more", () => {
    startGcPauseLogging();

    gcCallback({
      getEntries: () => [
        {
          duration: 812.6,
          detail: { kind: constants.NODE_PERFORMANCE_GC_MAJOR },
        },
      ],
    });

    expect(warnStub).to.have.been.calledOnceWith(
      { gcDurationMs: 813, gcKind: "major" },
      "Long garbage collection pause"
    );
  });

  it("should not log a garbage collection pause under 50ms", () => {
    startGcPauseLogging();

    gcCallback({
      getEntries: () => [
        {
          duration: 49.9,
          detail: { kind: constants.NODE_PERFORMANCE_GC_MINOR },
        },
      ],
    });

    expect(warnStub).not.to.have.been.called;
  });

  it("should log an unknown kind when the entry has no detail", () => {
    startGcPauseLogging();

    gcCallback({ getEntries: () => [{ duration: 60 }] });

    expect(warnStub).to.have.been.calledOnceWith(
      { gcDurationMs: 60, gcKind: "unknown" },
      "Long garbage collection pause"
    );
  });

  it("should stop observing when stopped", () => {
    const stop = startGcPauseLogging();

    stop();

    expect(disconnectStub).to.have.been.calledOnce;
  });
});
