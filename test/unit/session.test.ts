import { beforeEach, describe, it } from "mocha";
import type { RedisConfig } from "../../src/utils/types.js";
import { isRedisConfigEqual } from "../../src/config/session.js";
import { expect, sinon } from "../utils/test-utils.js";
import esmock from "esmock";

describe("session", () => {
  const redisConfig = {
    host: "test",
    port: 12345,
    password: "string",
    tls: true,
  };

  let connect: () => void;
  let disconnect: () => void;
  let on: () => void;
  let redisCreateClient: () => any;
  let getSessionStore: any;
  let disconnectRedisClient: any;

  beforeEach(async () => {
    connect = sinon.fake();
    disconnect = sinon.fake();
    on = sinon.fake();
    redisCreateClient = sinon.fake(() => ({ connect, disconnect, on }));

    ({ getSessionStore, disconnectRedisClient } = await esmock(
      "../../src/config/session.js",
      {
        redis: {
          createClient: redisCreateClient,
        },
      }
    ));
  });

  describe("getSessionStore", () => {
    it("should create a new client if none already exists and connect to redis", async () => {
      getSessionStore(redisConfig);
      expect(redisCreateClient).to.be.callCount(1);
      expect(connect).to.be.callCount(1);
      expect(on).to.be.callCount(1);
      expect(on).to.be.calledWithExactly("error", sinon.match.func);
    });

    it("should throw error when there is already a redis client and the config is different", async () => {
      getSessionStore(redisConfig);
      expect(() =>
        getSessionStore({ ...redisConfig, host: "somethingdifferent" })
      ).to.throw();
    });

    it("should not create a new client if one already exists with the same configuration", async () => {
      getSessionStore(redisConfig);
      getSessionStore(redisConfig);
      getSessionStore(redisConfig);
      getSessionStore(redisConfig);
      expect(redisCreateClient).to.be.callCount(1);
      expect(connect).to.be.callCount(1);
    });
  });

  describe("disconnectRedisClient", () => {
    it("should not error if there is no client", async () => {
      expect(() => disconnectRedisClient()).to.not.throw();
    });

    it("should disconnect the client if a client exists, clear up and allow new client", async () => {
      getSessionStore(redisConfig);

      await disconnectRedisClient();

      expect(disconnect).to.be.callCount(1);

      getSessionStore(redisConfig);
      expect(redisCreateClient).to.be.callCount(2);
      expect(connect).to.be.callCount(2);
    });
  });

  describe("isRedisConfigEqual", () => {
    const expectations: { a: RedisConfig; b: RedisConfig; equal: boolean }[] = [
      {
        equal: true,
        a: {
          host: "test",
          port: 12345,
          password: "string",
          tls: true,
        },
        b: {
          host: "test",
          port: 12345,
          password: "string",
          tls: true,
        },
      },
      {
        equal: false,
        a: {
          host: "test",
          port: 12345,
        },
        b: {
          host: "test",
          port: 12345,
          password: "string",
          tls: true,
        },
      },
      {
        equal: false,
        a: {
          host: "test",
          port: 12345,
          password: "incorrect",
          tls: true,
        },
        b: {
          host: "test",
          port: 12345,
          password: "string",
          tls: true,
        },
      },
    ];
    expectations.forEach((expectation) => {
      it(`should return ${expectation.equal} when a is ${JSON.stringify(expectation.a)} and b is ${JSON.stringify(expectation.b)}`, () => {
        expect(isRedisConfigEqual(expectation.a, expectation.b)).to.eq(
          expectation.equal
        );
      });
    });
  });
});
