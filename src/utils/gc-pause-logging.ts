import { PerformanceObserver, constants } from "node:perf_hooks";
import { logger } from "./logger.js";

const MIN_GC_PAUSE_MS = 50;

const GC_KINDS: Record<number, string> = {
  [constants.NODE_PERFORMANCE_GC_MINOR]: "minor",
  [constants.NODE_PERFORMANCE_GC_MAJOR]: "major",
  [constants.NODE_PERFORMANCE_GC_INCREMENTAL]: "incremental",
  [constants.NODE_PERFORMANCE_GC_WEAKCB]: "weakcb",
};

export function startGcPauseLogging(): () => void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration >= MIN_GC_PAUSE_MS) {
        const { detail } = entry as PerformanceEntry & {
          detail?: { kind?: number };
        };
        logger.warn(
          {
            gcDurationMs: Math.round(entry.duration),
            gcKind: GC_KINDS[detail?.kind] ?? "unknown",
          },
          "Long garbage collection pause"
        );
      }
    }
  });
  observer.observe({ entryTypes: ["gc"] });
  return () => observer.disconnect();
}
