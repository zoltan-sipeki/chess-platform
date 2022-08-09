import * as UserCache from "../../../common/user-cache.mjs";
import * as Chatroom from "./chatroom-cache.js";
import Database from "../database.js";
import { redis } from "../redis.js";

export async function get(userId, ...fields) {
    try {
        return await UserCache.get(Database, redis, userId, ...fields);
    }
    catch (err) {
        throw err;
    }
}

export async function set(userId, fields) {
    try {
        return await UserCache.set(redis, userId, fields);
    }
    catch (err) {
        throw err;
    }
}

export async function remove(userId) {
    try {
        await UserCache.remove(redis, userId);
    }
    catch (err) {
        throw err;
    }
}

export async function addFriend(userId, friendId) {
    try {
        const friends = await get(userId, "friends");
        friends.push(friendId);
        await set(userId, { friends });
    }
    catch (err) {
        throw err;
    }
}

export async function removeFriend(userId, friendId) {
    try {
        const friends = await get(userId, "friends");
        if (friends != null) {
            await set(userId, { friends: friends.filter(friend => friend !== friendId) });
        }
    }
    catch (err) {
        throw err;
    }
}

export async function addChatroom(userId, chatroomId) {
    try {
        const chatrooms = await get(userId, "chatrooms");
        if (!chatrooms.includes(chatroomId)) {
            chatrooms.push(chatroomId);
            await set(userId, { chatrooms });
        }
    }
    catch (err) {
        throw err;
    }
}

export async function removeFromChatrooms(userId) {
    try {
        const chatrooms = await get(userId, "chatrooms");
        if (chatrooms != null) {
            for (const chatroomId of chatrooms) {
                await Chatroom.removeMember(chatroomId, userId);
            }
        }
    }
    catch (err) {
        throw err;
    }
}
