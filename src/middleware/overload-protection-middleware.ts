import overloadProtection from "overload-protection";

export const applyOverloadProtection = (isProduction: boolean) => {
  return overloadProtection("express", {
    production: isProduction,
    clientRetrySecs: 3,
    sampleInterval: 10,
    maxEventLoopDelay: 500,
    maxHeapUsedBytes: 0,
    maxRssBytes: 0,
    errorPropagationMode: false,
    logging: "info",
    logStatsOnReq: false,
  });
};
