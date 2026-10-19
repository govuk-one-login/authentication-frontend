import type { Profiler } from "node:inspector";
import { Session } from "node:inspector/promises";
import { monitorEventLoopDelay } from "node:perf_hooks";
import { logger } from "./logger.js";

const SAMPLING_INTERVAL_MICROSECONDS = 10000;
const CAPTURE_START_SECOND = 58;
const CAPTURE_DURATION_MS = 8000;
const PAUSE_THRESHOLD_MS = 700;
const TOP_FUNCTION_COUNT = 15;

export function summariseProfile(
  profile: Profiler.Profile,
  topCount: number
): { fn: string; ms: number }[] {
  const frames = new Map(
    profile.nodes.map((node) => [node.id, node.callFrame])
  );
  const samples = profile.samples ?? [];
  const timeDeltas = profile.timeDeltas ?? [];
  const microsecondsByFunction = new Map<string, number>();
  samples.forEach((id, index) => {
    const frame = frames.get(id);
    if (!frame) {
      return;
    }
    const name = frame.functionName || "(anonymous)";
    const key = frame.url
      ? `${name} ${frame.url}:${frame.lineNumber + 1}`
      : name;
    const elapsed = timeDeltas[index + 1] ?? 0;
    microsecondsByFunction.set(
      key,
      (microsecondsByFunction.get(key) ?? 0) + elapsed
    );
  });
  return [...microsecondsByFunction.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, topCount)
    .map(([fn, microseconds]) => ({ fn, ms: Math.round(microseconds / 1000) }));
}

export function msUntilNextCapture(now: Date): number {
  const next = new Date(now);
  next.setSeconds(CAPTURE_START_SECOND, 0);
  if (next <= now) {
    next.setMinutes(next.getMinutes() + 1);
  }
  return next.getTime() - now.getTime();
}

async function capture(session: Session): Promise<void> {
  const delay = monitorEventLoopDelay({ resolution: 10 });
  delay.enable();
  await session.post("Profiler.enable");
  await session.post("Profiler.setSamplingInterval", {
    interval: SAMPLING_INTERVAL_MICROSECONDS,
  });
  await session.post("Profiler.start");
  await new Promise((resolve) =>
    setTimeout(resolve, CAPTURE_DURATION_MS).unref()
  );
  const { profile } = await session.post("Profiler.stop");
  await session.post("Profiler.disable");
  delay.disable();

  const maxDelayMs = Math.round(delay.max / 1e6);
  if (maxDelayMs > PAUSE_THRESHOLD_MS) {
    logger.warn(
      {
        maxDelayMs,
        topFunctions: summariseProfile(profile, TOP_FUNCTION_COUNT),
      },
      "Event loop pause profile"
    );
  }
}

export function startPauseProfiler(): () => void {
  const session = new Session();
  session.connect();
  let timer: NodeJS.Timeout;

  const scheduleNext = () => {
    timer = setTimeout(() => {
      capture(session)
        .catch((error) => logger.error(error, "Pause profiler failed"))
        .finally(scheduleNext);
    }, msUntilNextCapture(new Date()));
    timer.unref();
  };
  scheduleNext();

  return () => {
    clearTimeout(timer);
    session.disconnect();
  };
}
