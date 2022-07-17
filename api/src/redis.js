import Redis from "redis";

export const redis = Redis.createClient({ socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }, legacyMode: true });
redis.connect().then(() => console.log("redis connected"));
