import {
  CreateQueueCommand,
  type CreateQueueCommandInput,
  type CreateQueueResult,
  PurgeQueueCommand,
  type PurgeQueueCommandInput,
  ReceiveMessageCommand,
  type ReceiveMessageCommandInput,
  type ReceiveMessageResult,
  SendMessageCommand,
  type SendMessageCommandInput,
  SQSClient,
} from "@aws-sdk/client-sqs";
import { getAwsRegion } from "../config.js";

let client: SQSClient | undefined;

export type SqsClientConfig = {
  client: SQSClient;
  sendMessage: (message: SendMessageCommandInput) => Promise<void>;
  receiveMessage: (
    message: ReceiveMessageCommandInput
  ) => Promise<ReceiveMessageResult>;
  createQueue: (input: CreateQueueCommandInput) => Promise<CreateQueueResult>;
  purgeQueue: (input: PurgeQueueCommandInput) => Promise<void>;
};

function getSqsClientConfig(): SqsClientConfig {
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
  return {
    client,
    sendMessage: async (message: SendMessageCommandInput) => {
      await client.send(new SendMessageCommand(message));
    },
    receiveMessage: async (message: ReceiveMessageCommandInput) => {
      return await client.send(new ReceiveMessageCommand(message));
    },
    createQueue: async (input: CreateQueueCommandInput) => {
      return await client.send(new CreateQueueCommand(input));
    },
    purgeQueue: async (input: PurgeQueueCommandInput) => {
      await client.send(new PurgeQueueCommand(input));
    },
  };
}

export default getSqsClientConfig;
