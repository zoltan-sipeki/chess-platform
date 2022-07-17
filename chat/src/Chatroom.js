import { DB } from "./database.js";
import { redis } from "./redis.js";
import * as ChatroomCache  from "../../common/chatroom-cache.mjs";

export async function getMembers(chatroomId) {
    try {
        return await ChatroomCache.getMembers(DB, redis, chatroomId);
    }
    catch (err) {
        throw err;
    }
}

export async function removeMember(chatroomId, userId) {
    try {
        await ChatroomCache.removeMember(chatroomId, userId);
    }
    catch (err) {
        throw err;
    }
}

