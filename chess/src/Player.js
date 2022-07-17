import { Interval } from "./Interval.js";
import { DB } from "./database.js";
import { redis } from "./redis.js";
import { PIECE_COLOR } from "./chess/pieces/piece-constants.mjs";
import * as UserCache from "../../common/user-cache.mjs";

export class Player {
    static compare(a, b) {
        return Interval.compare(a.searchInterval, b.searchInterval);
    }

    constructor(id) {
        this.id = id;
        this.sockets = [];
        this.disconnected = false;
        this.searchInterval = null;
        this.queue = null;
        this.room = null;
    }

    async get(...fields) {
        try {
            return await UserCache.get(DB, redis, this.id, ...fields);
        }
        catch (err) {
            throw err;
        }
    }

    async set(fields) {
        try {
            await UserCache.set(redis, this.id, fields);
        }
        catch (err) {
            throw err;
        }
    }

    async update() {
        try {
            await UserCache.update(DB, redis, this.id);
        }
        catch (err) {
            throw err;
        }
    }


    disconnect() {
        for (const socket of this.sockets) {
            socket.close();
        }
    }

    hasConnections() {
        return this.sockets.length > 0;
    }

    addSocket(socket) {
        this.sockets.push(socket);
    }

    removeSocket(socket) {
        const index = this.sockets.findIndex(s => s === socket);
        if (index > -1) {
            this.sockets.splice(index, 1);
        }
    }

    send(msg) {
        for (const socket of this.sockets) {
            socket.send(JSON.stringify(msg));
        }
    }

    isInQueue() {
        return this.queue != null;
    }

    isInGame() {
        return this.room != null;
    }

    async json() {
        return await this.get("id", "name", "tag", "avatar");
    }

    expandSearchInterval() {
        if (this.searchInterval != null) {
            this.searchInterval.expand();
        }
    }

    setQueueTimeout(callback, timeOut) {
        if (this.searchInterval != null) {
            this.searchInterval.setTimer(callback, timeOut);
        }
    }

    clearQueueTimeout() {
        if (this.searchInterval != null) {
            this.searchInterval.clearTimer();
        }
    }
}

export class RoomPlayer {
    constructor(player) {
        this.player = player;
        this.ready = false;
        this.loaded = false;
        this.loadedTimer = -1;
        this.color = PIECE_COLOR.NONE;
    }

    async get(...fields) {
        try {
            return await this.player.get(...fields);
        }
        catch (err) {
            throw err;
        }
    }

    async set(fields) {
        try {
            await this.player.set(fields);
        }
        catch (err) {
            throw err;
        }
    }

    async update() {
        try {
            await this.player.update();
        }
        catch (err) {
            throw err;
        }
    }

    get id() {
        return this.player.id;
    }

    get room() {
        return this.player.room;
    }

    set room(value) {
        this.player.room = value;
    }

    get disconnected() {
        return this.player.disconnected;
    }

    setLoadTimeout(callback, timeOut) {
        this.loadedTimer = setTimeout(callback, timeOut);
    }

    clearLoadTimeout() {
        clearTimeout(this.loadedTimer);
        this.loadedTimer = -1;
    }

    send(msg) {
        this.player.send(msg);
    }

    async json() {
        const json = await this.player.json();
        json.color = this.color;
        return json;
    }
}
