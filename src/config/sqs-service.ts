import type {
  SQSClientConfig,
  SendMessageCommandOutput,
  CreateQueueCommandOutput,
  ReceiveMessageCommandOutput,
  PurgeQueueCommandOutput,
  SendMessageCommandInput,
  ReceiveMessageCommandInput,
  CreateQueueCommandInput,
  PurgeQueueCommandInput,
} from "@aws-sdk/client-sqs";
import {
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  CreateQueueCommand,
  PurgeQueueCommand,
} from "@aws-sdk/client-sqs";
import { getAwsRegion } from "../config.js";

let clientInstance: SQSClient | null = null;

function getClient(): SQSClient {
  if (!clientInstance) {
    const sqsClientConfig: SQSClientConfig = {
      region: getAwsRegion(),
      maxAttempts: 3,
    };

    if (process.env.TEST_SQS_ENDPOINT) {
      sqsClientConfig.endpoint = process.env.TEST_SQS_ENDPOINT;
      sqsClientConfig.credentials = {
        accessKeyId: "na",
        secretAccessKey: "na",
      };
    }

    clientInstance = new SQSClient(sqsClientConfig);
  }
  return clientInstance;
}

export const sqsService = {
  get client(): SQSClient {
    return getClient();
  },

  sendMessage: (
    input: SendMessageCommandInput
  ): Promise<SendMessageCommandOutput> =>
    getClient().send(new SendMessageCommand(input)),

  receiveMessage: (
    input: ReceiveMessageCommandInput
  ): Promise<ReceiveMessageCommandOutput> =>
    getClient().send(new ReceiveMessageCommand(input)),

  createQueue: (
    input: CreateQueueCommandInput
  ): Promise<CreateQueueCommandOutput> =>
    getClient().send(new CreateQueueCommand(input)),

  purgeQueue: (
    input: PurgeQueueCommandInput
  ): Promise<PurgeQueueCommandOutput> =>
    getClient().send(new PurgeQueueCommand(input)),
};
