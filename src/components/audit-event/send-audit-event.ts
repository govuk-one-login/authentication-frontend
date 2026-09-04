import { sqsService } from "../../config/sqs-service.js";
import { getAuditEventQueueUrl } from "../../config.js";

export async function sendAuditEvent(message: string): Promise<void> {
  await sqsService.sendMessage({
    QueueUrl: getAuditEventQueueUrl(),
    MessageBody: JSON.stringify(message),
  });
}
