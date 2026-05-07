import session from "express-session";
import connectDynamoDB from "connect-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const DynamoDBStore = connectDynamoDB(session);

export function getDynamoSessionStore() {
  const clientOptions: ConstructorParameters<typeof DynamoDBClient>[0] = {};
  if (process.env.DYNAMODB_ENDPOINT) {
    clientOptions.endpoint = process.env.DYNAMODB_ENDPOINT;
  }

  return new DynamoDBStore({
    table: process.env.DYNAMO_SESSION_TABLE_NAME || "frontend-sessions",
    hashKey: "id",
    prefix: "",
    client: new DynamoDBClient(clientOptions),
    initialized: true,
  });
}
