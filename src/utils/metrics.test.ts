import { describe } from "mocha";
import esmock from "esmock";
import { expect, sinon } from "../../test/utils/test-utils.js";
import type * as MetricsModule from "./metrics.js";

const UNIT_NONE = "None";

describe("metrics", () => {
  let setNamespace: sinon.SinonStub;
  let setDimensions: sinon.SinonStub;
  let putMetric: sinon.SinonStub;
  let loggerError: sinon.SinonStub;
  let metrics: typeof MetricsModule;
  let originalAppEnv: string | undefined;
  let putMetricCallsAtFlush: number | undefined;

  beforeEach(async () => {
    setNamespace = sinon.stub();
    setDimensions = sinon.stub();
    putMetric = sinon.stub();
    loggerError = sinon.stub();
    putMetricCallsAtFlush = undefined;

    const metricsLogger = { setNamespace, setDimensions, putMetric };

    metrics = await esmock("./metrics.js", {
      "aws-embedded-metrics": {
        metricScope:
          (handler: (logger: unknown) => (...args: unknown[]) => unknown) =>
          async (...args: unknown[]) => {
            const result = await handler(metricsLogger)(...args);
            putMetricCallsAtFlush = putMetric.callCount;
            return result;
          },
        Unit: { None: UNIT_NONE },
      },
      "./logger.js": { logger: { error: loggerError } },
    });

    originalAppEnv = process.env.APP_ENV;
    process.env.ENABLE_CLOUDWATCH_METRICS = "1";
    process.env.APP_ENV = "test-environment";
  });

  afterEach(() => {
    process.env.APP_ENV = originalAppEnv;
    delete process.env.ENABLE_CLOUDWATCH_METRICS;
  });

  describe("incrementCounter", () => {
    it("emits the metric with a value of 1", async () => {
      await metrics.incrementCounter(
        metrics.CloudwatchMetric.AUTH_JOURNEY_START
      );

      expect(putMetric).to.have.been.calledOnceWithExactly(
        "AuthJourneyStart",
        1,
        UNIT_NONE
      );
    });

    it("publishes to the Authentication namespace", async () => {
      await metrics.incrementCounter(
        metrics.CloudwatchMetric.AUTH_JOURNEY_START
      );

      expect(setNamespace).to.have.been.calledOnceWithExactly("Authentication");
    });

    it("sets the Environment dimension from the app environment", async () => {
      await metrics.incrementCounter(
        metrics.CloudwatchMetric.AUTH_JOURNEY_START
      );

      expect(setDimensions).to.have.been.calledOnceWithExactly({
        Environment: "test-environment",
      });
    });

    it("lets caller-supplied dimensions take precedence", async () => {
      await metrics.incrementCounter(
        metrics.CloudwatchMetric.AUTH_JOURNEY_START,
        {
          [metrics.CloudwatchMetricDimension.ENVIRONMENT]:
            "a-different-environment",
        }
      );

      expect(setDimensions).to.have.been.calledOnceWithExactly({
        Environment: "a-different-environment",
      });
    });

    it("records the metric before the scope flushes", async () => {
      await metrics.incrementCounter(
        metrics.CloudwatchMetric.AUTH_JOURNEY_START
      );

      expect(putMetricCallsAtFlush).to.equal(1);
    });
  });

  describe("putEmbeddedValue", () => {
    it("emits the metric with the supplied value", async () => {
      await metrics.putEmbeddedValue(
        metrics.CloudwatchMetric.AUTH_JOURNEY_START,
        1234
      );

      expect(putMetric).to.have.been.calledOnceWithExactly(
        "AuthJourneyStart",
        1234,
        UNIT_NONE
      );
    });
  });

  describe("when the feature flag is disabled", () => {
    ["0", undefined].forEach((flagValue) => {
      it(`emits nothing when ENABLE_CLOUDWATCH_METRICS is ${flagValue}`, async () => {
        if (flagValue === undefined) {
          delete process.env.ENABLE_CLOUDWATCH_METRICS;
        } else {
          process.env.ENABLE_CLOUDWATCH_METRICS = flagValue;
        }

        await metrics.incrementCounter(
          metrics.CloudwatchMetric.AUTH_JOURNEY_START
        );

        expect(putMetric).to.not.have.been.called;
      });
    });
  });

  describe("when emitting fails", () => {
    it("logs the error rather than propagating it", async () => {
      putMetric.throws(new Error("sink unavailable"));

      await metrics.incrementCounter(
        metrics.CloudwatchMetric.AUTH_JOURNEY_START
      );

      expect(loggerError).to.have.been.calledOnce;
      expect(loggerError.firstCall.args[1]).to.equal(
        "Failed to emit CloudWatch metric"
      );
    });
  });
});
