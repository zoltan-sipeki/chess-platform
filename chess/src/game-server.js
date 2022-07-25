import { RankedMMQueue, UnrankedMMQueue } from "./MMQueue.js";
import { Player, RoomPlayer } from "./Player.js";
import { MATCH, PrivateRoom, RankedRoom, UnrankedRoom } from "./Room.js";
import * as MSG from "./chess-message-types.mjs";
import { redisSub } from "./redis.js";
import { v4 as UUID } from "uuid";
import { RS_API_MESSAGES, RS_USER_DELETED } from "../../common/redis-sub-constants.mjs";
import { US_AWAY, US_OFFLINE } from "../../common/user-statuses.mjs";

const players = new Map();
const sockets = new Map();
const rooms = new Map();
const queues = {
    ranked: new RankedMMQueue(createRoom),
    unranked: new UnrankedMMQueue(createRoom)
};

export async function initServer() {
    await redisSub.connect();
    console.log("redis subscriber connected");
    
    redisSub.v4.subscribe(RS_API_MESSAGES, async message => {
        const msg = JSON.parse(message);
        
        if (msg.type === RS_USER_DELETED) {
            const player = players.get(msg.data.userId);
            if (player) {
                player.disconnect();
            }
        }
    });
}

export async function onConnect(userId, socket) {
    socket.addEventListener("message", (message) => {
        try {
            const msg = JSON.parse(message.data);
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

    socket.addEventListener("close", () => onDisconnect(socket));

    let player = players.get(userId);
    if (!player) {
        player = new Player(userId);
        players.set(userId, player);
    }
    else {
        player.disconnected = false;
    }
    player.addSocket(socket);
    sockets.set(socket, player);
}

export function getRoom(roomId) {
    return rooms.get(roomId);
}

function onDisconnect(socket) {
    const player = sockets.get(socket);

    if (player == null) {
        return;
    }

    player.removeSocket(socket);
    
    if (!player.hasConnections()) {
        handleExitQueue(player);

        if (player.isInGame()) {
            const room = rooms.get(player.room);
            if (room.gameStarted) {
                player.disconnected = true;
            }
            else {
                room.onDisconnect(player.id);
                rooms.delete(player.room);
                players.delete(player.id);
            }
        }
    }

    sockets.delete(socket);
}

function createRoom(players, matchType) {
    const roomId = UUID();

    players = players.map(player => new RoomPlayer(player));

    let room = null;
    switch (matchType) {
        case MATCH.PRIVATE:
            room = new PrivateRoom(roomId, players, onRoomClosing);
            break;
    
        case MATCH.RANKED:
            room = new RankedRoom(roomId, players, onRoomClosing);
            break;
        
        case MATCH.UNRANKED:
            room = new UnrankedRoom(roomId, players, onRoomClosing);
            break;

        default:
            break;
    }

    room.onCreated();
    rooms.set(roomId, room);
}

function onRoomClosing(roomId, roomPlayers) {
    for (const player of roomPlayers) {
        if (player.disconnected) {
            players.delete(player.id);
        }
    }
    rooms.delete(roomId);
}

function handleMessage(msg, socket) {
    const player = sockets.get(socket);

    if (!player) {
        return;
    }

    if (!("type" in msg) || !("data" in msg)) {
        return;
    }

    switch (msg.type) {
        case MSG.C_QUEUE:
            handleEnqueue(msg, player);
            break;

        case MSG.C_EXIT_QUEUE:
            handleExitQueue(player);
            break;

        case MSG.C_INVITE:
            handleInvite(msg, player);
            break;

        default:
            handleGameMessages(msg, player);
            break;
    }
}

function handleEnqueue(msg, player) {
    if ("type" in msg.data && (msg.data.type === "ranked" || msg.data.type === "unranked")) {
        queues[msg.data.type].enqueue(player);
    }
}

function handleExitQueue(player) {
    if (player.queue != null) {
        queues[player.queue].dequeue(player);
        player.send({ type: MSG.S_EXIT_QUEUE, data: null });
    }
}

async function handleInvite(msg, inviter) {
    if (!("inviteeId" in msg.data)) {
        return;
    } 

    const invitee = players.get(msg.data.inviteeId);
    if (invitee == null) {
        return;
    }
    
    const status = await invitee.get("status");
    if (status === US_OFFLINE) {
        return;
    }

    if (!invitee.isInQueue() && !invitee.isInGame() && !inviter.isInQueue() && !inviter.isInGame()) {
        createRoom([inviter, invitee], MATCH.PRIVATE);
    }
}

function handleGameMessages(msg, player) {
    if (player.room == null) {
        return;
    }

    const room = rooms.get(player.room);

    switch (msg.type) {
        case MSG.C_READY:
            room.onReady(player.id);
            break;

        case MSG.C_DECLINE:
            handleDecline(room, player.id);
            break;

        case MSG.C_LOAD:
            room.onLoaded(player.id);
            break;

        case MSG.C_MOVE:
            handleMove(msg, room, player.id);
            break;

        case MSG.C_PROMOTE:
            handlePromotion(msg, room, player.id);
            break;

        case MSG.C_RESIGN:
            room.onResign(player.id)
            break;

        default:
            break;
    }
}

function handleDecline(room, playerId) {
    room.onDecline(playerId);
    rooms.delete(room.id);
}

function handleMove(msg, room, playerId) {
    if (!("move" in msg.data)) {
        return;
    }

    const { move } = msg.data;
    if (!("from" in move) || !("to" in move)) {
        return;
    }

    const { from, to } = move;
    if (!("row" in from) || !("col" in from) || !("row" in to) || !("col" in to)) {
        return;
    }

    room.onMove(playerId, move);
}

function handlePromotion(msg, room, playerId) {
    if (!("pieceType" in msg.data)) {
        return;
    }

    room.onPromotion(playerId, msg.data.pieceType);
}