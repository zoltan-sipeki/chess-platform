import * as ChatroomCache from "../../../common/chatroom-cache.mjs";
import db from "../database.js";
import { redis } from "../redis.js";

export async function getMembers(chatroomId) {
    try {
        return await ChatroomCache.getMembers(db, redis, chatroomId);
    }
    catch (err) {
        throw err;
    }
}

export async function removeMember(chatroomId, userId) {
    try { 
        await ChatroomCache.removeMember(redis, chatroomId, userId);
    }
    catch (err) {
        throw err;
    }
}
