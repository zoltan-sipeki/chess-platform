import * as UserCache from "../../common/user-cache.mjs";
import { redis } from "./redis.js";
import { DB } from "./database.js";

export class User {
    constructor(id) {
        this.id = id;
        this.sockets = [];
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
}