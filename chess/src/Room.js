import { ServerChessBoard } from "./chess/chessboard/ServerChessBoard.mjs";
import { DB } from "./database.js";
import { notifyChatServer } from "./redis.js";
import { calculateELORating } from "./elo-rating.js";
import FS from "fs/promises";
import { mypath } from "../../common/utils.mjs";
import * as MSG from "./chess-message-types.mjs";
import { RS_GAME_OVER, RS_GAME_STARTED } from "../../common/redis-sub-constants.mjs";
import { writeFile } from "../../common/utils.mjs";

export const MATCH = {
    PRIVATE: "private",
    RANKED: "ranked",
    UNRANKDED: "unranked"
}

const LOAD_TIMEOUT = 60000;
const READY_TIMEOUT = 10000;

const REPLAY_PATH = mypath(import.meta.url, "../../data/replays");

class Room {
    constructor(id, players, onCloseCallback) {
        this.id = id;
        this.players = players;
        this.players.forEach(player => player.room = this.id);
        this.createdAt = new Date();
        this.chessboard = new ServerChessBoard(this.createdAt.getTime(), this.onFlagFall.bind(this));
        this.readyTimeout = -1;
        this.gameStarted = false;
        this.onCloseCallback = onCloseCallback;
    }

    async onCreated() {
        this.readyTimeout = setTimeout(() => this.onReadyTimeout(), READY_TIMEOUT);
    }

    onReady(playerId) {
        const player = this.getPlayer(playerId);

        player.ready = true;
        this.sendToAllExcept(playerId, {
            type: MSG.S_READY,
            data: null
        });

        if (this.bothReady()) {
            clearTimeout(this.readyTimeout);
            this.readyTimeout = -1;
            this.players.forEach((player) =>
                player.setLoadTimeout(() => this.onLoadTimeout(), LOAD_TIMEOUT)
            );
        }
    }

    onLoaded(playerId) {
        const player = this.getPlayer(playerId);
        if (!player.ready || player.loaded) {
            return;
        }

        player.loaded = true;
        player.clearLoadTimeout();

        if (this.bothLoaded()) {
            this.gameStarted = true;
            this.startGame();
        }
    }

    onDecline(playerId) {
        const player = this.getPlayer(playerId);
        if (player.ready) {
            return;
        }

        clearTimeout(this.readyTimeout);
        this.removePlayers();
        this.sendToAllExcept(playerId, { type: MSG.S_DECLINE, data: { playerId } });
    }

    async onDisconnect(playerId) {
        const player = this.getPlayer(playerId);
        clearTimeout(this.readyTimeout);
        this.removePlayers();
        this.sendToAllExcept(playerId, { type: MSG.S_DISCONNECT, data: { player: await player.json() } });
    }

    onLoadTimeout() {
        if (!this.bothLoaded()) {
            this.removePlayers();
            this.sendToAll({
                type: MSG.S_LOAD_ERROR,
                data: {
                    players: this.players.filter((player) => !player.loaded).map((player) => player.id)
                }
            });
            this.onCloseCallback(this.id, this.players);
        }
    }

    onReadyTimeout() {
        this.removePlayers();
        this.sendToAll({
            type: MSG.S_READY_ERROR,
            data: {
                players: this.players.filter((player) => !player.ready).map((player) => player.id)
            }
        });
        this.onCloseCallback(this.id, this.players);
    }

    async onMove(playerId, move) {
        const result = this.chessboard.move(this.getPlayer(playerId).color, move);
        if (result.scoreboard != null) {
            await this.onGameOver(result.scoreboard);
        }
        this.sendToAll({ type: MSG.S_MOVE, data: result });
    }

    async onPromotion(playerId, pieceType) {
        const result = this.chessboard.promote(this.getPlayer(playerId).color, pieceType);
        if (result.scoreboard != null) {
            await this.onGameOver(result.scoreboard);
        }
        this.sendToAll({ type: MSG.S_MOVE, data: result });
    }

    async onResign(playerId) {
        const result = this.chessboard.resign(this.getPlayer(playerId).color);
        await this.onGameOver(result.scoreboard);
        this.sendToAll({ type: MSG.S_RESIGN, data: result });
    }

    async onFlagFall(result) {
        await this.onGameOver(result.scoreboard);
        this.sendToAll({ type: MSG.S_FLAG_FALL, data: result });
    }

    removePlayers() {
        this.players.forEach((player) => {
            player.clearLoadTimeout();
            player.room = null;
        });
    }

    getPlayer(playerId) {
        return this.players.find((player) => player.id === playerId);
    }

    bothReady() {
        return this.players.every((player) => player.ready);
    }

    bothLoaded() {
        return this.players.every((player) => player.loaded);
    }

    async startGame() {
        this.assignColors();
        const msg = this.chessboard.startGame();
        msg.players = await Promise.all(this.players.map(player => player.json()));
        await Promise.all(this.players.map(async player => player.set({ matchIdInProgress: this.id })));
        await DB.query(`
            UPDATE users
            SET matchIdInProgress = ?
            WHERE id = ? OR id = ?        
        `, [this.id, this.players[0].id, this.players[1].id]);

        msg.color = this.players[0].color;
        this.players[0].send({ type: MSG.S_START_GAME, data: msg });

        msg.color = this.players[1].color;
        this.players[1].send({ type: MSG.S_START_GAME, data: msg });

        this.sendToAll({ type: MSG.S_GAME_STARTED, data: { matchId: this.id } });

        notifyChatServer(this.players, RS_GAME_STARTED);
    }

    assignColors() {
        const index = Math.round(Math.random());
        this.players[0].color = ServerChessBoard.TURNS[index];
        this.players[1].color = ServerChessBoard.TURNS[1 - index];
    }

    async getGameState(playerId) {
        return {
            color: this.getPlayer(playerId).color,
            players: await Promise.all(this.players.map(player => player.json())),
            gameState: this.chessboard.getState()
        };
    }

    sendToAll(msg) {
        this.players.forEach((player) => player.send(msg));
    }

    sendToAllExcept(playerId, msg) {
        this.players.forEach((player) => {
            if (player.id !== playerId) {
                player.send(msg);
            }
        });
    }

    async onGameOver(scoreboard) {
        await Promise.all(this.players.map(player => player.set({ matchIdInProgress: null })));
        this.onCloseCallback(this.id, this.players);
        notifyChatServer(this.players, RS_GAME_OVER);
        this.sendToAll({ type: MSG.S_GAME_ENDED, data: { matchId: this.id } });
        this.removePlayers();
    }

    async updateDB(scoreboard, updatedMMR, matchType) {
        const now = new Date();
        const elapsed = now.getTime() - this.createdAt.getTime();

        const SECOND_MS = 1000;
        const MINUTE_MS = 60 * SECOND_MS;
        const HOUR_MS = 60 * MINUTE_MS;

        const duration = {
            hours: Math.floor(elapsed / HOUR_MS),
            minutes: Math.floor(elapsed % HOUR_MS / MINUTE_MS),
            seconds: Math.floor(elapsed % HOUR_MS % MINUTE_MS / SECOND_MS)
        };

        const connection = await DB.getConnection();
        await connection.beginTransaction();
        await connection.query(`
            INSERT INTO matches (id, createdAt, duration, type) VALUES(?, ?, MAKETIME(?, ?, ?), ?)
        `, [this.id, this.createdAt, duration.hours, duration.minutes, duration.seconds, matchType]);
        await connection.batch(`
            INSERT INTO scoreboard (matchId, userId, color, mmrChange, mmrAfter, score) VALUES (?, ?, ?, ?, ?, ?)
        `, this.players.map(player => {
            const score = scoreboard.scores[player.color];
            const { mmrChanges } = scoreboard;
            let mmrChange = null;
            let mmrAfter = null;
            if (mmrChanges != null) {
                mmrChange = mmrChanges[player.color].change;
                mmrAfter = mmrChanges[player.color].mmrAfter;
            }

            return [this.id, player.id, player.color, mmrChange, mmrAfter, score];
        }));

        if (updatedMMR != null) {
            for (const player of this.players) {
                const mmr = await player.get(updatedMMR);
                await connection.query(`
                    UPDATE users
                    SET ${updatedMMR} = ?
                    WHERE id = ?
                `, [mmr, player.id]);
            }
        }

        await connection.query(`
            UPDATE users
            SET matchIdInProgress = ?
            WHERE id = ? OR id = ?
        `, [null, this.players[0].id, this.players[1].id]);

        await connection.query(`
            UPDATE users
            SET lastPlayed = ?
            WHERE id = ? OR id = ?
        `, [now, this.players[0].id, this.players[1].id]);

        if (matchType != MATCH.PRIVATE) {
            for (const player of this.players) {
                const score = scoreboard.scores[player.color];
                const updateResult = await connection.query(`
                    UPDATE stats
                    SET gamesPlayed = gamesPlayed + 1, wins = wins + ?, losses = losses + ?, draws = draws + ?
                    WHERE userId = ? AND matchType = ?
                `, [score === 1 ? 1 : 0, score === 0 ? 1 : 0, score === 0.5 ? 1 : 0, player.id, matchType]);

                if (updateResult.affectedRows === 0) {
                    await connection.query(`
                        INSERT INTO stats (userId, matchType, gamesPlayed, wins, losses, draws) VALUES (?, ?, ?, ?, ?, ?)
                    `, [player.id, matchType, 1, score === 1 ? 1 : 0, score === 0 ? 1 : 0, score === 0.5 ? 1 : 0]);
                }
            }
        }

        await connection.commit();
        await connection.end();
    }

    async saveReplay(scoreboard) {
        await writeFile(REPLAY_PATH, `${this.id}.json`, JSON.stringify({
            players: this.players.map(player => ({ id: player.id, color: player.color })),
            scoreboard,
            moves: this.chessboard.moves
        }));

        this.sendToAll({ type: MSG.S_REPLAY_READY, data: { replayId: this.id } });
    }
}

export class PrivateRoom extends Room {
    async onCreated() {
        await super.onCreated();
        const inviter = this.players[0];
        const invitee = this.players[1];

        inviter.ready = true;
        inviter.send({ type: MSG.S_INVITE_SUCCESS, data: { roomId: this.id, invitee: await invitee.json() } });
        invitee.send({ type: MSG.S_INVITE, data: { roomId: this.id, inviter: await inviter.json() } });
    }

    async onGameOver(scoreboard) {
        super.onGameOver(scoreboard);
        this.updateDB(scoreboard, null, MATCH.PRIVATE);
        this.saveReplay(scoreboard);
    }
}

export class UnrankedRoom extends Room {
    async onCreated() {
        await super.onCreated();
        this.sendToAll({ type: MSG.S_GAME_READY, data: { roomId: this.id } });
    }

    async calculateMMR(scoreboard) {
        const mmr1 = await this.players[0].get("unrankedMMR");
        const score1 = scoreboard.scores[this.players[0].color];

        const mmr2 = await this.players[1].get("unrankedMMR");
        const score2 = scoreboard.scores[this.players[1].color];

        return calculateELORating(mmr1, score1, mmr2, score2);
    }

    async onGameOver(scoreboard) {
        await super.onGameOver(scoreboard);
        const updatedMMRs = await this.calculateMMR(scoreboard);
        await Promise.all(updatedMMRs.map((mmr, index) => this.players[index].set({ urankedMMR: mmr })));
        this.updateDB(scoreboard, "unrankedMMR", MATCH.UNRANKDED);
        this.saveReplay(scoreboard);
    }
}

export class RankedRoom extends Room {
    async onCreated() {
        await super.onCreated();
        this.sendToAll({ type: MSG.S_GAME_READY, data: { roomId: this.id } });
    }

    async calculateMMR(scoreboard) {
        const mmr1 = await this.players[0].get("rankedMMR");
        const score1 = scoreboard.scores[this.players[0].color];

        const mmr2 = await this.players[1].get("rankedMMR");
        const score2 = scoreboard.scores[this.players[1].color];

        return calculateELORating(mmr1, score1, mmr2, score2);
    }

    async onGameOver(scoreboard) {
        await super.onGameOver(scoreboard);
        const updatedMMRs = await this.calculateMMR(scoreboard);
        const player1 = this.players[0];
        const player2 = this.players[1];
        scoreboard.mmrChanges = {
            [player1.color]: {
                change: updatedMMRs[0] - await player1.get("rankedMMR"),
                mmrAfter: updatedMMRs[0]
            },
            [player2.color]: {
                change: updatedMMRs[1] - await player2.get("rankedMMR"),
                mmrAfter: updatedMMRs[1]
            }
        }

        await Promise.all(updatedMMRs.map((mmr, index) => this.players[index].set({ rankedMMR: mmr })));
        this.updateDB(scoreboard, "rankedMMR", MATCH.RANKED);
        this.saveReplay(scoreboard);
    }

}
