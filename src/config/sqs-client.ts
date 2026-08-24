import { SQSClient } from "@aws-sdk/client-sqs";
import { getAwsRegion } from "../config.js";
import { sendToTXMA } from "@govuk-one-login/event-catalogue-utils";

function getSqsClient(): SQSClient {
  const clientOptions: ConstructorParameters<typeof SQSClient>[0] = {
    region: getAwsRegion(),
    maxAttempts: 3,
  };

  if (process.env.SQS_ENDPOINT) {
    clientOptions.endpoint = process.env.SQS_ENDPOINT;
    clientOptions.credentials = {
      accessKeyId: "na",
      secretAccessKey: "na",
    };
  }

  return new SQSClient(clientOptions);
}

sendToTXMA(
  "AUTH_PASSKEY_AUTHENTICATION_FAILED",
  {
    component_id: "",
    event_timestamp_ms: 0,
    timestamp: 0,
    event_name: "AUTH_PASSKEY_AUTHENTICATION_FAILED",
  },
  process.env.SQS_ENDPOINT,
  {
    sqsClient: getSqsClient(),
  }
);

export const sqsClient = getSqsClient();
