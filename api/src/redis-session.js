import Session from "express-session";
import ConnectRedis from "connect-redis";
import { redis, redisSub } from "./redis.js";

const RedisStore = ConnectRedis(Session);
const redisSession = Session({
    name: "SID",
    store: new RedisStore({ client: redis }),
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        path: "/",
        httpOnly: true,
        sameSite: true
    }
});

redisSub.connect().then(() => {
    console.log("redis subscriber connected");
    redisSub.v4.subscribe("__keyevent@0__:del", cleanUp);
    redisSub.v4.subscribe("__keyevent@0__:expired", cleanUp);
});

async function cleanUp(key) {
    const tokens = key.split(":");
    if (tokens.length > 0 && tokens[0] === "sess") {
        const sessUserKey = `sess-user:${tokens[1]}`;
        const userId = await redis.v4.get(sessUserKey);
        await redis.v4.lRem(`active-sessions:${userId}`, 0, tokens[1]);
        await redis.v4.del(sessUserKey);
    }
}


export { redisSession };