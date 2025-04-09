import { describe, beforeEach, it } from "mocha";
import { RedisConfig } from "../../src/utils/types.js";
import { isRedisConfigEqual } from "../../src/config/session.js";
import { expect, sinon } from "../utils/test-utils.js";
import decache from "decache";
import { RedisModules } from "redis";

describe("session", () => {
  const redisConfig = {
    host: "test",
    port: 12345,
    password: "string",
    tls: true,
  };

  let redis: RedisModules;
  let connect: () => void;
  let disconnect: () => void;

  beforeEach(async () => {
    decache("../../src/config/session");
    decache("redis");
    redis = await import("redis");
    connect = sinon.fake();
    disconnect = sinon.fake();
    sinon
      .stub(redis, "createClient")
      .callsFake(() => ({ connect, disconnect }));
  });

  describe("getSessionStore", () => {
    it("should create a new client if none already exists and connect to redis", async () => {
      const { getSessionStore } = await import("../../src/config/session");
      getSessionStore(redisConfig);
      expect(redis.createClient).to.be.callCount(1);
      expect(connect).to.be.callCount(1);
    });

    it("should throw error when there is already a redis client and the config is different", async () => {
      const { getSessionStore } = await import("../../src/config/session");
      getSessionStore(redisConfig);
      expect(() =>
        getSessionStore({ ...redisConfig, host: "somethingdifferent" })
      ).to.throw();
    });

    it("should not create a new client if one already exists with the same configuration", async () => {
      const { getSessionStore } = await import("../../src/config/session");
      getSessionStore(redisConfig);
      getSessionStore(redisConfig);
      getSessionStore(redisConfig);
      getSessionStore(redisConfig);
      expect(redis.createClient).to.be.callCount(1);
      expect(connect).to.be.callCount(1);
    });
  });

  describe("disconnectRedisClient", () => {
    it("should not error if there is no client", async () => {
      const { disconnectRedisClient } = await import(
        "../../src/config/session"
      );
      expect(() => disconnectRedisClient()).to.not.throw();
    });

    it("should disconnect the client if a client exists, clear up and allow new client", async () => {
      const { getSessionStore, disconnectRedisClient } = await import(
        "../../src/config/session"
      );
      getSessionStore(redisConfig);

      await disconnectRedisClient();

      expect(disconnect).to.be.callCount(1);

      getSessionStore(redisConfig);
      expect(redis.createClient).to.be.callCount(2);
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
