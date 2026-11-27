const TIMESTAMP_WITH_TIME_ZONE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(Z|[+-]\d{2}:\d{2})$/;

export interface StatusBannerShowingTimes {
  showFrom?: Date;
  showUntil?: Date;
  problems: string[];
}

function parseOptionalTimestamp(
  value: string | undefined,
  envVarName: string,
  problems: string[]
): Date | undefined {
  if (!value) {
    return undefined;
  }
  const timestamp = new Date(value);
  if (
    !TIMESTAMP_WITH_TIME_ZONE.test(value) ||
    Number.isNaN(timestamp.getTime())
  ) {
    problems.push(
      `${envVarName} '${value}' must be written with a time zone, like 2026-11-21T09:00Z or 2026-11-21T09:00+01:00`
    );
    return undefined;
  }
  return timestamp;
}

export function parseStatusBannerShowingTimes(
  rawShowFrom: string | undefined,
  rawShowUntil: string | undefined
): StatusBannerShowingTimes {
  const problems: string[] = [];
  const showFrom = parseOptionalTimestamp(
    rawShowFrom,
    "STATUS_BANNER_SHOW_FROM",
    problems
  );
  const showUntil = parseOptionalTimestamp(
    rawShowUntil,
    "STATUS_BANNER_SHOW_UNTIL",
    problems
  );

  if (showFrom && showUntil && showFrom >= showUntil) {
    problems.push(
      "STATUS_BANNER_SHOW_FROM must be before STATUS_BANNER_SHOW_UNTIL"
    );
  }

  return {
    ...(showFrom && { showFrom }),
    ...(showUntil && { showUntil }),
    problems,
  };
}

export function isShowingAt(
  { showFrom, showUntil, problems }: StatusBannerShowingTimes,
  now: Date
): boolean {
  const hasValidTimes = problems.length === 0;
  const hasStarted = !showFrom || now >= showFrom;
  const hasEnded = !!showUntil && now >= showUntil;
  return hasValidTimes && hasStarted && !hasEnded;
}
