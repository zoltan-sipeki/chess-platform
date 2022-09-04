import { User } from "./User.js";
import * as Chatroom from "./chatroom.js";
import * as Message from "./message.js";
import * as MSG from "./chat-message-types.mjs";
import { v4 as UUID } from "uuid";
import { redisSub } from "./redis.js";
import * as REDIS_SUB from "../../common/redis-sub-constants.mjs";
import * as STATUS from "../../common/user-statuses.mjs";

const users = new Map();
const sockets = new Map();

export async function initServer() {
    await redisSub.connect();
    console.log("redis subscriber connected");
    
    redisSub.v4.subscribe(REDIS_SUB.RS_CHESS_STATUS_CHANGE, async message => {
        const msg = JSON.parse(message);

        for (const entry of msg.data.users) {
            const user = users.get(entry.userId);
            if (!user) {
                continue;
            }

            const status = await user.get("status");
            let statusText = "";
            switch (msg.type) {
                case REDIS_SUB.RS_GAME_STARTED:
                    statusText = STATUS.US_IN_GAME;
                    break;

                case REDIS_SUB.RS_ENQUEUED:
                    statusText = STATUS.US_LOOKING_FOR_MATCH;
                    break;

                case REDIS_SUB.RS_GAME_OVER:
                case REDIS_SUB.RS_DEQUEUED:
                    statusText = status;
                    break;

                default:
                    break;
            }

            await user.set({ statusText });
            user.update();
            if (status !== STATUS.US_OFFLINE) {
                notifyFriends(user, { statusText });
            }
        }
    });

    redisSub.v4.subscribe(REDIS_SUB.RS_API_MESSAGES, async message => {
        const msg = JSON.parse(message);
        if (msg.type === REDIS_SUB.RS_USER_DELETED) {
            const user = users.get(msg.data.userId);
            if (user) {
                user.disconnect();
            }
        }
    });

}

export async function onConnect(socket, userId) {
    socket.addEventListener("message", e => {
        try {
            const msg = JSON.parse(e.data);
            handleMessage(msg, socket);
        } catch (err) {
            if (err instanceof SyntaxError) {
                socket.close(1003, "Unsupported data.");
            }
            else {
                console.error(err);
            }
        }
    });

    socket.addEventListener("close", e => {
        onDisconnect(socket);
    });

    let user = users.get(userId);
    if (!user) {
        user = new User(userId);
        const defaultStatus = await user.get("defaultStatus");
        const status = { status: defaultStatus, statusText: defaultStatus };
        await user.set(status);
        user.update();
        if (defaultStatus !== STATUS.US_OFFLINE) {
            notifyFriends(user, status);
        }
        users.set(userId, user);
    }
    user.addSocket(socket);
    sockets.set(socket, user);
}

async function onDisconnect(socket) {
    const user = sockets.get(socket);
    if (user) {
        user.removeSocket(socket);
        if (user.sockets.length === 0) {
            const lastOnline = new Date();
            const change = { lastOnline, status: STATUS.US_OFFLINE };
            await user.set(change);
            user.update();
            const defaultStatus = await user.get("defaultStatus");
            if (defaultStatus !== STATUS.US_OFFLINE) {
                notifyFriends(user, change);
            }
            users.delete(user.id);
        }
    }
    sockets.delete(socket);
}

function handleMessage(msg, socket) {
    const sender = sockets.get(socket);

    switch (msg.type) {
        case MSG.C_MESSAGE:
            handleChatMessage(msg, sender);
            break;

        case MSG.C_TYPING:
            handleTyping(msg, sender);
            break;

        case MSG.C_MESSAGE_SEEN:
            handleMessageSeen(msg, sender);
            break;

        case MSG.C_STATUS_CHANGE:
            handleStatusChange(msg, sender);
            break;
    }
}

async function handleTyping(msg, sender) {
    const { chatroomId } = msg.data;
    const chatrooms = await sender.get("chatrooms");
    if (!chatrooms.includes(chatroomId)) {
        return;
    }
    const members = await Chatroom.getMembers(chatroomId);
    for (const memberId of members) {
        const member = users.get(memberId);
        if (member && member.id !== sender.id) {
            member.send({ type: MSG.S_TYPING, data: { name: await sender.get("name"), chatroomId } })
        }
    }
}

async function handleChatMessage(msg, sender) {
    const { chatroomId, text } = msg.data;
    const chatrooms = await sender.get("chatrooms");
    if (!chatrooms.includes(chatroomId)) {
        return;
    }
    const createdAt = new Date();
    const messageId = UUID();

    const members = await Chatroom.getMembers(chatroomId);
    for (const memberId of members) {
        const member = users.get(memberId);
        if (member) {
            member.send({
                type: MSG.S_MESSAGE, data: {
                    message: {
                        id: messageId,
                        createdAt,
                        text,
                        sender: await sender.get("id", "name", "tag", "avatar", "status"),
                    },
                    chatroomId
                }
            });
        }
    }
    Message.save(chatroomId, messageId, text, createdAt, sender.id);
}

async function handleMessageSeen(msg, sender) {
    const messageId = msg.data;
    await Message.setSeen(messageId, sender.id);
}

async function handleStatusChange(msg, sender) {
    const { defaultStatus, status } = msg.data;
    
    if (defaultStatus && defaultStatus === STATUS.US_OFFLINE) {
        const currentDefaultStatus = await sender.get("defaultStatus");
        if (currentDefaultStatus === STATUS.US_OFFLINE) {
            return;
        }
        const changes = { status, lastOnline: new Date() };
        await sender.set({ defaultStatus, ...changes });
        notifyFriends(sender, changes);
    }
    else {
        let statusText = await sender.get("statusText");
        if (statusText !== STATUS.US_LOOKING_FOR_MATCH && statusText !== STATUS.US_IN_GAME) {
            statusText = status;
        }
        
        if (defaultStatus) {
            await sender.set({ defaultStatus, status, statusText });
        }
        else {
            await sender.set({ status, statusText });
        }
        
        notifyFriends(sender, { status, statusText });
    }
    sender.update();
}

async function notifyFriends(user, changes) {
    const friends = await user.get("friends");
    if (!friends) {
        return;
    }
    for (const friendId of friends) {
        const friend = users.get(friendId);
        if (friend) {
            friend.send({ type: MSG.S_STATUS_CHANGE, data: { senderId: user.id, changes } });
        }
    }
}


