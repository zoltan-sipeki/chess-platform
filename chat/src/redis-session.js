import Session from "express-session";
import ConnectRedis from "connect-redis";
import { redis } from "./redis.js";

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

export { redisSession };