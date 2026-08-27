import { SQSClient } from "@aws-sdk/client-sqs";
import { getAwsRegion } from "../config.js";

let client: SQSClient | undefined

function getSqsClient(): SQSClient {
  if (!client) {
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

    client = new SQSClient(clientOptions);
  }
  return client
}

export default getSqsClient;
