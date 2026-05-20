import { afterEach, beforeEach, describe, it } from "mocha";
import { expect, sinon } from "../utils/test-utils.js";
import { DualSessionStore } from "../../src/config/dual-session-store.js";
import { type SessionData, Store } from "express-session";

describe("DualSessionStore", () => {
  let redis: Store;
  let dynamo: Store;
  let store: DualSessionStore;
  const sid = "test-session-id";
  const session = { cookie: { originalMaxAge: 3600000 } } as SessionData;

  beforeEach(() => {
    redis = Object.create(Store.prototype);
    dynamo = Object.create(Store.prototype);
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("get", () => {
    it("should return session from redis", (done) => {
      redis.get = sinon.fake((_sid, cb) => cb(null, session));
      dynamo.get = sinon.fake((_sid, cb) => cb(null, session));
      store = new DualSessionStore(redis, dynamo);

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        done();
      });
    });

    it("should fallback to dynamo when redis fails", (done) => {
      const dynamoSession = { cookie: { originalMaxAge: 9999 } } as SessionData;
      redis.get = sinon.fake((_sid, cb) => cb(new Error("redis failure")));
      dynamo.get = sinon.fake((_sid, cb) => cb(null, dynamoSession));
      store = new DualSessionStore(redis, dynamo);

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(dynamoSession);
        done();
      });
    });

    it("should return dynamo error when both redis and dynamo fail", (done) => {
      const dynamoErr = new Error("dynamo failure");
      redis.get = sinon.fake((_sid, cb) => cb(new Error("redis failure")));
      dynamo.get = sinon.fake((_sid, cb) => cb(dynamoErr));
      store = new DualSessionStore(redis, dynamo);

      store.get(sid, (err) => {
        expect(err).to.equal(dynamoErr);
        done();
      });
    });

    it("should perform dynamo consistency check read", (done) => {
      redis.get = sinon.fake((_sid, cb) => cb(null, session));
      dynamo.get = sinon.fake((_sid, cb) => {
        cb(null, session);
        done();
      });
      store = new DualSessionStore(redis, dynamo);

      store.get(sid, () => {});
    });

    it("should not throw when dynamo consistency check fails", (done) => {
      redis.get = sinon.fake((_sid, cb) => cb(null, session));
      dynamo.get = sinon.fake((_sid, cb) => cb(new Error("dynamo failure")));
      store = new DualSessionStore(redis, dynamo);

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        setTimeout(done, 10);
      });
    });
  });

  describe("set", () => {
    it("should write to redis and call back", (done) => {
      redis.set = sinon.fake((_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(null));
      dynamo.set = sinon.fake((_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(null));
      store = new DualSessionStore(redis, dynamo);

      store.set(sid, session, (err) => {
        expect(err).to.be.null;
        done();
      });
    });

    it("should return redis error to callback", (done) => {
      const error = new Error("redis write failure");
      redis.set = sinon.fake((_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(error));
      dynamo.set = sinon.fake((_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(null));
      store = new DualSessionStore(redis, dynamo);

      store.set(sid, session, (err) => {
        expect(err).to.equal(error);
        done();
      });
    });

    it("should also write to dynamo", (done) => {
      redis.set = sinon.fake((_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(null));
      dynamo.set = sinon.fake((_sid: string, _sess: SessionData, cb: (err?: any) => void) => {
        cb(null);
        done();
      });
      store = new DualSessionStore(redis, dynamo);

      store.set(sid, session, () => {});
    });

    it("should not throw when dynamo write fails", (done) => {
      redis.set = sinon.fake((_sid: string, _sess: SessionData, cb: (err?: any) => void) => cb(null));
      dynamo.set = sinon.fake((_sid: string, _sess: SessionData, cb: (err?: any) => void) =>
        cb(new Error("dynamo failure"))
      );
      store = new DualSessionStore(redis, dynamo);

      store.set(sid, session, (err) => {
        expect(err).to.be.null;
        setTimeout(done, 10);
      });
    });
  });

  describe("destroy", () => {
    it("should destroy in redis and call back", (done) => {
      redis.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) => cb(null));
      dynamo.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) => cb(null));
      store = new DualSessionStore(redis, dynamo);

      store.destroy(sid, (err) => {
        expect(err).to.be.null;
        done();
      });
    });

    it("should return redis error to callback", (done) => {
      const error = new Error("redis destroy failure");
      redis.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) => cb(error));
      dynamo.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) => cb(null));
      store = new DualSessionStore(redis, dynamo);

      store.destroy(sid, (err) => {
        expect(err).to.equal(error);
        done();
      });
    });

    it("should also destroy in dynamo", (done) => {
      redis.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) => cb(null));
      dynamo.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) => {
        cb(null);
        done();
      });
      store = new DualSessionStore(redis, dynamo);

      store.destroy(sid, () => {});
    });

    it("should not throw when dynamo destroy fails", (done) => {
      redis.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) => cb(null));
      dynamo.destroy = sinon.fake((_sid: string, cb: (err?: any) => void) =>
        cb(new Error("dynamo failure"))
      );
      store = new DualSessionStore(redis, dynamo);

      store.destroy(sid, (err) => {
        expect(err).to.be.null;
        setTimeout(done, 10);
      });
    });
  });

  describe("touch", () => {
    it("should touch in redis and call back", (done) => {
      redis.touch = sinon.fake((_sid: string, _sess: SessionData, cb: () => void) => cb());
      dynamo.touch = sinon.fake((_sid: string, _sess: SessionData, cb: () => void) => cb());
      store = new DualSessionStore(redis, dynamo);

      store.touch(sid, session, () => {
        done();
      });
    });

    it("should also touch in dynamo", (done) => {
      redis.touch = sinon.fake((_sid: string, _sess: SessionData, cb: () => void) => cb());
      dynamo.touch = sinon.fake((_sid: string, _sess: SessionData, cb: () => void) => {
        cb();
        done();
      });
      store = new DualSessionStore(redis, dynamo);

      store.touch(sid, session, () => {});
    });

    it("should not throw when dynamo touch fails", (done) => {
      redis.touch = sinon.fake((_sid: string, _sess: SessionData, cb: () => void) => cb());
      dynamo.touch = sinon.fake((_sid: string, _sess: SessionData, cb: (err?: any) => void) =>
        cb(new Error("dynamo failure"))
      );
      store = new DualSessionStore(redis, dynamo);

      store.touch(sid, session, () => {
        setTimeout(done, 10);
      });
    });
  });

  describe("consistency checks", () => {
    it("should not error when sessions match", (done) => {
      redis.get = sinon.fake((_sid, cb) => cb(null, session));
      dynamo.get = sinon.fake((_sid, cb) => cb(null, session));
      store = new DualSessionStore(redis, dynamo);

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        setTimeout(done, 10);
      });
    });

    it("should not throw when sessions differ", (done) => {
      const differentSession = {
        cookie: { originalMaxAge: 9999 },
      } as SessionData;
      redis.get = sinon.fake((_sid, cb) => cb(null, session));
      dynamo.get = sinon.fake((_sid, cb) => cb(null, differentSession));
      store = new DualSessionStore(redis, dynamo);

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        setTimeout(done, 10);
      });
    });

    it("should not throw when redis has session but dynamo does not", (done) => {
      redis.get = sinon.fake((_sid, cb) => cb(null, session));
      dynamo.get = sinon.fake((_sid, cb) => cb(null, null));
      store = new DualSessionStore(redis, dynamo);

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.deep.equal(session);
        setTimeout(done, 10);
      });
    });

    it("should not throw when both stores return null", (done) => {
      redis.get = sinon.fake((_sid, cb) => cb(null, null));
      dynamo.get = sinon.fake((_sid, cb) => cb(null, null));
      store = new DualSessionStore(redis, dynamo);

      store.get(sid, (err, sess) => {
        expect(err).to.be.null;
        expect(sess).to.be.null;
        setTimeout(done, 10);
      });
    });
  });
});
