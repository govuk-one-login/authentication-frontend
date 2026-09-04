import { describe } from "mocha";
import { expect } from "chai";
import { sqsService } from "../sqs-service.js";

const QUEUE_NAME = "sqs-service-integration-test-queue";

describe("Integration:: sqs-service", () => {
  let queueUrl: string;

  before(async function () {
    const { QueueUrl } = await sqsService.createQueue({
      QueueName: QUEUE_NAME,
    });
    queueUrl = QueueUrl;
  });

  afterEach(async () => {
    await sqsService.purgeQueue({ QueueUrl: queueUrl });
  });

  it("sends and receives a message", async function () {
    const messageBody = JSON.stringify({ event: "test-event", timestamp: 123 });

    await sqsService.sendMessage({
      QueueUrl: queueUrl,
      MessageBody: messageBody,
    });

    const { Messages } = await sqsService.receiveMessage({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5,
    });

    expect(Messages).to.have.length(1);
    expect(Messages[0].Body).to.equal(messageBody);
  });

  it("receives no messages from an empty queue", async function () {
    const { Messages } = await sqsService.receiveMessage({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 1,
    });

    expect(Messages).to.be.undefined;
  });

  it("purges all messages from the queue", async function () {
    await sqsService.sendMessage({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify({ event: "to-be-purged" }),
    });

    await sqsService.purgeQueue({ QueueUrl: queueUrl });

    const { Messages } = await sqsService.receiveMessage({
      QueueUrl: queueUrl,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 1,
    });

    expect(Messages).to.be.undefined;
  });
});
