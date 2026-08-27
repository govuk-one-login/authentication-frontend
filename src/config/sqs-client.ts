import { SQSClient } from "@aws-sdk/client-sqs";
import { getAwsRegion } from "../config.js";

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

export const sqsClient = getSqsClient();
