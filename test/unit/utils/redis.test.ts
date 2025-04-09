import { expect } from "chai";
import { describe } from "mocha";
import { ENVIRONMENT_NAME } from "../../../src/app.constants.js";
import { sinon } from "../../../test/utils/test-utils.js";
import ssm from "../../../src/utils/ssm.js";
import { getRedisConfig } from "../../../src/utils/redis.js";
describe("get correct redis config values", () => {
  let getParametersStub: sinon.SinonStub;

  beforeEach(() => {
    process.env.REDIS_KEY = "redis-key";
    process.env.APP_ENV = "test";
    getParametersStub = sinon.stub(ssm, "getParameters");
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.REDIS_PASSWORD;
  });

  it("should return expected host and port only when not in prod", async () => {
    process.env.REDIS_HOST = "expected_redis_host";
    process.env.REDIS_PORT = "1234";
    process.env.NODE_ENV = ENVIRONMENT_NAME.DEV;

    const redisConfig = await getRedisConfig();

    expect(redisConfig.host).to.eql("expected_redis_host");
    expect(redisConfig.port).to.eql(1234);
  });

  describe("should return correct values when in prod", () => {
    it("should get correct values from env vars when present", async () => {
      process.env.NODE_ENV = ENVIRONMENT_NAME.PROD;
      process.env.REDIS_HOST = "expected_redis_host";
      process.env.REDIS_PORT = "1234";
      process.env.REDIS_PASSWORD = "expected_redis_password";

      const redisConfig = await getRedisConfig();

      expect(redisConfig.host).to.equal("expected_redis_host");
      expect(redisConfig.port).to.equal(1234);
      expect(redisConfig.password).to.equal("expected_redis_password");
      expect(redisConfig.tls).to.equal(true);
    });

    it("should get values from SSM when no env vars are present", async () => {
      process.env.NODE_ENV = ENVIRONMENT_NAME.PROD;

      getParametersStub.resolves({
        $metadata: undefined,
        InvalidParameters: [],
        Parameters: [
          {
            Name: "test-redis-key-redis-master-host",
            Type: "String",
            Value: "hostValue",
          },
          { Name: "test-redis-key-redis-port", Type: "String", Value: "1234" },
          {
            Name: "test-redis-key-redis-password",
            Type: "String",
            Value: "passwordValue",
          },
        ],
      });

      const redisConfig = await getRedisConfig();

      expect(redisConfig).to.eql({
        host: "hostValue",
        port: 1234,
        password: "passwordValue",
        tls: true,
      });
    });

    it("should throw error when invalid parameters are used to get ssm values", async () => {
      process.env.NODE_ENV = ENVIRONMENT_NAME.PROD;

      getParametersStub.resolves({
        $metadata: undefined,
        InvalidParameters: [
          "invalid-redis-host",
          "invalid-redis-port",
          "invalid-redis-password",
        ],
        Parameters: [],
      });

      try {
        await getRedisConfig();
      } catch (error) {
        expect(error).to.be.an("error");
        expect(error.message).to.be.equal(
          "Invalid SSM config values for redis"
        );
      }
    });

    it("should throw error when result does not contain expected ssm parameter", async () => {
      process.env.NODE_ENV = ENVIRONMENT_NAME.PROD;

      getParametersStub.resolves({
        $metadata: undefined,
        InvalidParameters: [],
        Parameters: [
          {
            Name: "test-redis-key-redis-master-host",
            Type: "String",
            Value: "hostValue",
          },
          { Name: "test-redis-key-redis-port", Type: "String", Value: "1234" },
        ],
      });

      try {
        await getRedisConfig();
      } catch (error) {
        expect(error).to.be.an("error");
        expect(error.message).to.be.equal(
          "Expected to find key test-redis-key-redis-password in ssm parameters"
        );
      }
    });

    it("should throw error when invalid parameters are used to get ssm values", async () => {
      process.env.NODE_ENV = ENVIRONMENT_NAME.PROD;
      delete process.env.REDIS_KEY;

      try {
        await getRedisConfig();
      } catch (error) {
        expect(error).to.be.an("error");
        expect(error.message).to.be.equal(
          "There is no REDIS_KEY present in env variables"
        );
      }
    });
  });
});
