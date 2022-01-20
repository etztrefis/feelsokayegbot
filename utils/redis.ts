import * as Redis from "ioredis";
import { KeyType } from "ioredis";
import * as pc from "picocolors";
import { okayeg } from "..";

const redis = new Redis.default({ db: 3 });

redis.on("error", (error) => {
  okayeg.Logger.error(`${pc.red("[REDIS]")} ${error}`);
});

redis.on("ready", () => {
  okayeg.Logger.info(`${pc.green("[REDIS]")} Connected!`);
});

const set = async (key: KeyType, data: boolean, expiry = 120) => {
  if (expiry === 0) {
    await redis.set(key, JSON.stringify(data));
  } else {
    await redis.set(key, JSON.stringify(data), "EX", expiry);
  }
};

const setpx = async (key: KeyType, data: boolean, expiry = 120) => {
  if (expiry === 0) {
    await redis.set(key, JSON.stringify(data));
  } else {
    await redis.set(key, JSON.stringify(data), "PX", expiry);
  }
};

const get = async (key: KeyType) => {
  const data = await redis.get(key);
  if (!data) {
    return null;
  }
  return JSON.parse(data);
};

export { redis, set as redisSet, get as redisGet, setpx };
