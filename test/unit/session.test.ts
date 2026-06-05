import { describe, it } from "mocha";
import { expect } from "../utils/test-utils.js";
import esmock from "esmock";

describe("session", () => {
  describe("getSessionStore", () => {
    it("should return the DynamoDB session store", async () => {
      const fakeDynamoStore = { fake: "dynamo-store" };

      const { getSessionStore } = await esmock("../../src/config/session.js", {
        "../../src/config/dynamodb-session.js": {
          getDynamoSessionStore: () => fakeDynamoStore,
        },
      });

      const store = getSessionStore();
      expect(store).to.equal(fakeDynamoStore);
    });
  });
});
