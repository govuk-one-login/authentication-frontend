import { PerformanceObserver, constants } from "node:perf_hooks";
import type { NextFunction, Request, Response } from "express";
import { logger } from "./logger.js";

const CHECK_INTERVAL_MS = 50;
const MIN_FREEZE_MS = 200;
const MIN_GC_PAUSE_MS = 50;

const GC_KINDS: Record<number, string> = {
  [constants.NODE_PERFORMANCE_GC_MINOR]: "minor",
  [constants.NODE_PERFORMANCE_GC_MAJOR]: "major",
  [constants.NODE_PERFORMANCE_GC_INCREMENTAL]: "incremental",
  [constants.NODE_PERFORMANCE_GC_WEAKCB]: "weakcb",
};

let inFlightRequests = 0;
let lastRequest:
  { method: string; path: string; startedAt: number } | undefined;

export function trackInFlightRequestsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  inFlightRequests += 1;
  lastRequest = {
    method: req.method,
    path: req.path,
    startedAt: performance.now(),
  };
  res.once("close", () => {
    inFlightRequests -= 1;
  });
  next();
}

function startGcPauseLogging(): () => void {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.duration >= MIN_GC_PAUSE_MS) {
        const { detail } = entry as PerformanceEntry & {
          detail?: { kind?: number };
        };
        const kind = detail?.kind;
        logger.warn(
          {
            gcDurationMs: Math.round(entry.duration),
            gcKind: GC_KINDS[kind] ?? "unknown",
          },
          "Long garbage collection pause"
        );
      }
    }
  });
  observer.observe({ entryTypes: ["gc"] });
  return () => observer.disconnect();
}

function startFreezeLogging(): () => void {
  let lastCheck = performance.now();
  let lastCpuUsage = process.cpuUsage();
  let lastInvoluntaryContextSwitches =
    process.resourceUsage().involuntaryContextSwitches;

  const timer = setInterval(() => {
    const now = performance.now();
    const cpuUsage = process.cpuUsage(lastCpuUsage);
    const involuntaryContextSwitches =
      process.resourceUsage().involuntaryContextSwitches;
    const freezeMs = now - lastCheck - CHECK_INTERVAL_MS;

    if (freezeMs >= MIN_FREEZE_MS) {
      const { heapUsed, heapTotal, rss } = process.memoryUsage();
      logger.warn(
        {
          freezeMs: Math.round(freezeMs),
          freezeStartedAt: new Date(Date.now() - freezeMs).toISOString(),
          cpuUserMs: Math.round(cpuUsage.user / 1000),
          cpuSystemMs: Math.round(cpuUsage.system / 1000),
          involuntaryContextSwitches:
            involuntaryContextSwitches - lastInvoluntaryContextSwitches,
          heapUsed,
          heapTotal,
          rss,
          uptimeSeconds: Math.round(process.uptime()),
          inFlightRequests,
          lastRequest: lastRequest && {
            method: lastRequest.method,
            path: lastRequest.path,
            startedMsAgo: Math.round(now - lastRequest.startedAt),
          },
        },
        "Event loop freeze"
      );
    }

    lastCheck = now;
    lastCpuUsage = process.cpuUsage();
    lastInvoluntaryContextSwitches = involuntaryContextSwitches;
  }, CHECK_INTERVAL_MS);
  timer.unref();

  return () => clearInterval(timer);
}

export function startEventLoopDiagnostics(): () => void {
  const stopGcPauseLogging = startGcPauseLogging();
  const stopFreezeLogging = startFreezeLogging();
  return () => {
    stopGcPauseLogging();
    stopFreezeLogging();
  };
}
