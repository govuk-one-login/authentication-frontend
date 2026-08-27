import {
  createEvent,
  sendToTXMA,
} from "@govuk-one-login/event-catalogue-utils";
import type { Events } from "@govuk-one-login/event-catalogue";
import { sqsClient } from "../../config/sqs-client.js";

const someAsyncFunc = async () => {
  sendAuditEvent(
    "AUTH_PASSKEY_AUTHENTICATION_FAILED",
    {
      "journey-type": "SIGN_IN",
      passkey: {
        passkey_authentication_failure_reason: "SecurityError",
      },
    },
    {
      device_information: {
        encoded: "someEncodedThing",
      },
    }
  );
};

type Extensions<T extends keyof Events> = "extensions" extends keyof Events[T]
  ? Events[T]["extensions"]
  : never;

type Restricted<T extends keyof Events> = "restricted" extends keyof Events[T]
  ? Events[T]["restricted"]
  : never;

function sendAuditEvent<T extends keyof Events>(
  eventName: T,
  extensions: Extensions<T>,
  restricted: Restricted<T>
) {
  const baseAuditEvent = {
    component_id: "",
    event_timestamp_ms: 0,
    timestamp: 0,
    event_name: eventName,
  };

  const event = createEvent(eventName, {
    ...baseAuditEvent,
    extensions,
    restricted,
  });

  sendToTXMA(eventName, event, process.env.SQS_ENDPOINT, {
    sqsClient: sqsClient,
  });
}
