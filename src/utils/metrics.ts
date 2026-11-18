import { metricScope, Unit } from "aws-embedded-metrics";
import { enableCloudwatchMetrics, getAppEnv } from "../config.js";
import { logger } from "./logger.js";

const METRIC_NAMESPACE = "Authentication";

export enum CloudwatchMetric {
  AUTH_JOURNEY_START = "AuthJourneyStart",
}

export enum CloudwatchMetricDimension {
  ENVIRONMENT = "Environment",
}

type MetricDimensions = Partial<Record<CloudwatchMetricDimension, string>>;

const emitMetric = metricScope(
  (metrics) =>
    async (
      metric: CloudwatchMetric,
      value: number,
      dimensions: MetricDimensions
    ): Promise<void> => {
      metrics.setNamespace(METRIC_NAMESPACE);
      metrics.setDimensions({
        [CloudwatchMetricDimension.ENVIRONMENT]: getAppEnv(),
        ...dimensions,
      });
      metrics.putMetric(metric, value, Unit.None);
    }
);

export async function putEmbeddedValue(
  metric: CloudwatchMetric,
  value: number,
  dimensions: MetricDimensions = {}
): Promise<void> {
  if (!enableCloudwatchMetrics()) {
    return;
  }

  try {
    await emitMetric(metric, value, dimensions);
  } catch (error) {
    logger.error({ err: error, metric }, "Failed to emit CloudWatch metric");
  }
}

export async function incrementCounter(
  metric: CloudwatchMetric,
  dimensions: MetricDimensions = {}
): Promise<void> {
  await putEmbeddedValue(metric, 1, dimensions);
}
