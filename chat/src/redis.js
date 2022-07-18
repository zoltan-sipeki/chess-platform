import Redis from "redis";

export const redis = Redis.createClient({ 
    socket: {
        tls: true,
        host: process.env.REDIS_HOST, 
        port: process.env_REDIS_PORT 
    },
    username: process.env.REDIS_USER_CHAT,
    password: process.env.REDIS_PASSWORD_CHAT,
    legacyMode: true 
});

redis.connect().then(() => console.log("redis connected"));

export const redisSub = redis.duplicate();
redisSub.connect().then(() => console.log("redis subscriber connected"));