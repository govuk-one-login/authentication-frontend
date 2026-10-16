import { describe } from "mocha";
import { constants } from "node:perf_hooks";
import { EventEmitter } from "node:events";
import esmock from "esmock";
import { expect, sinon } from "../../test/utils/test-utils.js";

describe("event-loop-diagnostics", () => {
  let clock: sinon.SinonFakeTimers;
  let nowStub: sinon.SinonStub;
  let warnStub: sinon.SinonStub;
  let gcCallback: (list: { getEntries: () => unknown[] }) => void;
  let observeStub: sinon.SinonStub;
  let disconnectStub: sinon.SinonStub;
  let diagnostics: any;

  beforeEach(async () => {
    clock = sinon.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    nowStub = sinon.stub(performance, "now").returns(0);
    sinon.stub(process, "cpuUsage").returns({ user: 450000, system: 30000 });
    sinon
      .stub(process, "resourceUsage")
      .onFirstCall()
      .returns({ involuntaryContextSwitches: 10 } as NodeJS.ResourceUsage)
      .returns({ involuntaryContextSwitches: 25 } as NodeJS.ResourceUsage);
    sinon.stub(process, "memoryUsage").returns({
      heapUsed: 100,
      heapTotal: 200,
      rss: 300,
      external: 0,
      arrayBuffers: 0,
    });
    sinon.stub(process, "uptime").returns(3600.4);

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

    diagnostics = await esmock("./event-loop-diagnostics.js", {
      "./logger.js": { logger: { warn: warnStub } },
      "node:perf_hooks": {
        PerformanceObserver: FakePerformanceObserver,
        constants,
      },
    });
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  describe("event loop freezes", () => {
    it("should log a freeze when a check runs 200ms or more late", () => {
      diagnostics.startEventLoopDiagnostics();
      nowStub.returns(550);

      clock.tick(50);

      expect(warnStub).to.have.been.calledOnceWith(
        sinon.match({
          freezeMs: 500,
          freezeStartedAt: sinon.match.string,
          cpuUserMs: 450,
          cpuSystemMs: 30,
          involuntaryContextSwitches: 15,
          heapUsed: 100,
          heapTotal: 200,
          rss: 300,
          uptimeSeconds: 3600,
          inFlightRequests: 0,
          lastRequest: undefined,
        }),
        "Event loop freeze"
      );
    });

    it("should not log when a check runs less than 200ms late", () => {
      diagnostics.startEventLoopDiagnostics();
      nowStub.returns(249);

      clock.tick(50);

      expect(warnStub).not.to.have.been.called;
    });

    it("should include the requests in progress", () => {
      diagnostics.startEventLoopDiagnostics();
      const res = new EventEmitter();
      const next = sinon.stub();
      nowStub.returns(100);
      diagnostics.trackInFlightRequestsMiddleware(
        { method: "POST", path: "/enter-email" },
        res,
        next
      );
      nowStub.returns(600);

      clock.tick(50);

      expect(next).to.have.been.calledOnce;
      expect(warnStub).to.have.been.calledOnceWith(
        sinon.match({
          inFlightRequests: 1,
          lastRequest: {
            method: "POST",
            path: "/enter-email",
            startedMsAgo: 500,
          },
        }),
        "Event loop freeze"
      );
    });

    it("should stop counting a request once its response closes", () => {
      diagnostics.startEventLoopDiagnostics();
      const res = new EventEmitter();
      diagnostics.trackInFlightRequestsMiddleware(
        { method: "GET", path: "/enter-password" },
        res,
        sinon.stub()
      );
      res.emit("close");
      nowStub.returns(550);

      clock.tick(50);

      expect(warnStub).to.have.been.calledOnceWith(
        sinon.match({ inFlightRequests: 0 }),
        "Event loop freeze"
      );
    });
  });

  describe("garbage collection pauses", () => {
    it("should observe garbage collection entries", () => {
      diagnostics.startEventLoopDiagnostics();

      expect(observeStub).to.have.been.calledOnceWith({ entryTypes: ["gc"] });
    });

    it("should log a garbage collection pause of 50ms or more", () => {
      diagnostics.startEventLoopDiagnostics();

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
      diagnostics.startEventLoopDiagnostics();

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
      diagnostics.startEventLoopDiagnostics();

      gcCallback({ getEntries: () => [{ duration: 60 }] });

      expect(warnStub).to.have.been.calledOnceWith(
        { gcDurationMs: 60, gcKind: "unknown" },
        "Long garbage collection pause"
      );
    });
  });

  it("should stop both checks when stopped", () => {
    const stop = diagnostics.startEventLoopDiagnostics();
    stop();
    nowStub.returns(550);

    clock.tick(50);

    expect(disconnectStub).to.have.been.calledOnce;
    expect(warnStub).not.to.have.been.called;
  });
});
