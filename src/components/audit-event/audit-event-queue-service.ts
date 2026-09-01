import getSqsClientConfig from "../../config/sqs-client.js";
import { getAuditEventQueueUrl } from "../../config.js";
import type { AuditEventQueueService } from "./types.js";

export function auditEventQueueService(): AuditEventQueueService {
  const sendAuditEvent = async function (): Promise<void> {
    const sqsClient = getSqsClientConfig();
    const message = {
      QueueUrl: getAuditEventQueueUrl(),
      MessageBody: JSON.stringify({ message: "this is a test" }),
    };
    await sqsClient.sendMessage(message);
  };

  return {
    sendAuditEvent,
  };
}
