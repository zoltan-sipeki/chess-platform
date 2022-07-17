import Redis from "redis";
import { RS_CHESS_STATUS_CHANGE } from "../../common/redis-sub-constants.mjs";

export const redis = Redis.createClient({ socket: { host: process.env.REDIS_HOST, port: process.env.REDIS_PORT }, legacyMode: true });
redis.connect().then(() => console.log("redis connected"));

export const redisSub = redis.duplicate();
redisSub.connect().then(() => console.log("redis subscriber connected"));


export function notifyChatServer(players, msgType) {
    const users = players.map(player => ({
        userId: player.id,
    }));

    redis.v4.publish(RS_CHESS_STATUS_CHANGE, JSON.stringify({ type: msgType, data: { users } }));
}