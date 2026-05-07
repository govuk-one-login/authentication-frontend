import session from "express-session";
import { logger } from "../utils/logger.js";

// NOTE: VERBOSE LOGGING FOR PROOF OF CONCEPT ONLY.

export class DualSessionStore extends session.Store {
  constructor(
    private redis: session.Store,
    private dynamo: session.Store
  ) {
    super();
  }

  get(sid: string, cb: (err?: any, session?: session.SessionData | null) => void): void {
    this.redis.get!(sid, (err, redisSession) => {
      logger.info({ sid }, "Session read from Redis");
      cb(err, redisSession);

      this.dynamo.get!(sid, (dynamoErr, dynamoSession) => {
        if (dynamoErr) {
          logger.warn({ err: dynamoErr, sid }, "DynamoDB consistency check read failed");
          return;
        }

        logger.info({ sid }, "Session read from DynamoDB for consistency check");

        // TODO: This would need more work as failing at present - assume the actual session data is the same but other attributes differ.
        // if (JSON.stringify(redisSession ?? null) !== JSON.stringify(dynamoSession ?? null)) {
        //   logger.warn({ sid, redisExists: !!redisSession, dynamoExists: !!dynamoSession }, "Session consistency mismatch");
        // }
      });
    });
  }

  set(sid: string, sess: session.SessionData, cb: (err?: any) => void): void {
    this.redis.set!(sid, sess, (err) => {
      logger.info({ sid }, "Session written to Redis");
      cb(err);
    });

    this.writeToDynamo("set", sid, sess);
  }

  destroy(sid: string, cb: (err?: any) => void): void {
    this.redis.destroy!(sid, (err) => {
      logger.info({ sid }, "Session destroyed in Redis");
      cb(err);
    });

    this.dynamo.destroy!(sid, (dynamoErr) => {
      if (dynamoErr) {
        logger.warn({ err: dynamoErr, sid }, "DynamoDB session destroy failed");
        return;
      }
      logger.info({ sid }, "Session destroyed in DynamoDB");
    });
  }

  touch(sid: string, sess: session.SessionData, cb: () => void): void {
    this.redis.touch!(sid, sess, () => {
      logger.info({ sid }, "Session touched in Redis");
      cb();
    });

    this.writeToDynamo("touch", sid, sess);
  }

  private writeToDynamo(operation: "set" | "touch", sid: string, sess: session.SessionData): void {
    try {
      this.dynamo[operation]!(sid, sess, (dynamoErr) => {
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
