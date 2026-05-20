import { type SessionData, Store } from "express-session";
import { logger } from "../utils/logger.js";

export class DualSessionStore extends Store {
  constructor(
    private redis: Store,
    private dynamo: Store
  ) {
    super();
  }

  get(sid: string, cb: (err?: any, session?: SessionData | null) => void): void {
    this.redis.get(sid, (err, redisSession) => {
      logger.info({ sid }, "Session read from Redis");
      cb(err, redisSession);
    });
  }

  set(sid: string, sess: SessionData, cb: (err?: any) => void): void {
    this.redis.set(sid, sess, (err) => {
      logger.info({ sid }, "Session written to Redis");
      cb(err);
    });

    this.writeToDynamo("set", sid, sess);
  }

  destroy(sid: string, cb: (err?: any) => void): void {
    this.redis.destroy(sid, (err) => {
      logger.info({ sid }, "Session destroyed in Redis");
      cb(err);
    });

    this.dynamo.destroy(sid, (dynamoErr) => {
      if (dynamoErr) {
        logger.warn({ err: dynamoErr, sid }, "DynamoDB session destroy failed");
        return;
      }
      logger.info({ sid }, "Session destroyed in DynamoDB");
    });
  }

  touch(sid: string, sess: SessionData, cb: () => void): void {
    this.redis.touch(sid, sess, () => {
      logger.info({ sid }, "Session touched in Redis");
      cb();
    });

    this.writeToDynamo("touch", sid, sess);
  }

  private writeToDynamo(operation: "set" | "touch", sid: string, sess: SessionData): void {
    try {
      this.dynamo[operation](sid, sess, (dynamoErr) => {
        if (dynamoErr) {
          logger.warn({ err: dynamoErr, sid, operation }, "DynamoDB session write failed");
          return;
        }
        logger.info({ sid, operation }, "Session written to DynamoDB");
      });
    } catch (err) {
      logger.warn({ err, sid, operation }, "DynamoDB session write threw unexpectedly");
    }
  }
}
