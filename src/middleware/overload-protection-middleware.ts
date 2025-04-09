import type { HttpProtectionInstance } from "overload-protection";
import overloadProtection from "overload-protection";

export const applyOverloadProtection = (
  isProduction: boolean
): HttpProtectionInstance => {
  return overloadProtection("express", {
    production: isProduction,
    clientRetrySecs: 3,
    sampleInterval: 10,
    maxEventLoopDelay: 700,
    maxHeapUsedBytes: 0,
    maxRssBytes: 0,
    errorPropagationMode: false,
    logging: "info",
    logStatsOnReq: false,
  });
};
