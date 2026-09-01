import { describe } from "mocha";
import { expect } from "../../../../test/utils/test-utils.js";
import type { Request } from "express";
import getSqsClientConfig, {
  type SqsClientConfig,
} from "../../../config/sqs-client.js";
import { auditEventQueueService } from "../audit-event-queue-service.js";

const QUEUE_NAME = "TxMASQSProducerAuditEventQueue";

describe("Integration:: audit-event-queue", () => {
  let sqsClientConfig: SqsClientConfig;
  let sendAuditEvent: (req: Request) => Promise<void>;

  before(async function () {
    process.env.SQS_ENDPOINT = "http://localhost:4566";
    sqsClientConfig = getSqsClientConfig();

    const { QueueUrl } = await sqsClientConfig.createQueue({
      QueueName: QUEUE_NAME,
    });
    process.env.AUDIT_EVENTS_QUEUE_URL = QueueUrl;
    sendAuditEvent = auditEventQueueService().sendAuditEvent;
  });

  afterEach(async () => {
    await sqsClientConfig.purgeQueue({
      QueueUrl: process.env.AUDIT_EVENTS_QUEUE_URL,
    });
  });

  it("sends a message to the configured audit event queue", async function () {
    await sendAuditEvent({} as Request);

    const { Messages } = await sqsClientConfig.receiveMessage({
      QueueUrl: process.env.AUDIT_EVENTS_QUEUE_URL,
      MaxNumberOfMessages: 10,
      WaitTimeSeconds: 5,
    });

    expect(Messages).to.have.length(1);
    expect(JSON.parse(Messages![0].Body!)).to.deep.equal({
      message: "this is a test",
    });
  });
});
