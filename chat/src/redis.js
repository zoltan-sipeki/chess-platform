import Redis from "redis";

export const redis = Redis.createClient({ socket: { host: "localhost", port: 6379 }, legacyMode: true });
redis.connect().then(() => console.log("redis connected"));

export const redisSub = redis.duplicate();
redisSub.connect().then(() => console.log("redis subscriber connected"));