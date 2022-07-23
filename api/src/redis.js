import Redis from "redis";

export const redis = Redis.createClient({ 
    socket: {
        tls: true,
        host: process.env.REDIS_HOST, 
        port: process.env.REDIS_PORT 
    },
    username: process.env.REDIS_USER_API,
    password: process.env.REDIS_PASSWORD_API,
    legacyMode: true 
});

export const redisSub = redis.duplicate();

redis.connect().then(() => console.log("redis connected"));
