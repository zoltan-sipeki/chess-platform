import Express from "express";
import Database from "../../../database.js";
import SearchRoute from "./search.js";
import { addUserDataToQueryResult } from "../../../utils/misc.js";
import { notifyFriendsOfRemoval } from "../../middlewares.js";
import * as UserCache from "../../../utils/user-cache.js";
import * as SSE from "../../../utils/sse-messages-types.mjs";
import { v4 as UUID } from "uuid";

const router = Express.Router();

router.use("/search", SearchRoute);
router.use("/:id", checkIfUserExists);
router.get("/:id", isProfileVisible, async (req, res, next) => {
    const friendLimit = Number.parseInt(req.query.friends);
    const matchLimit = Number.parseInt(req.query.matches);

    let connection = await Database.getConnection();
    try {
        const [user] = await connection.query(`
            SELECT u.id, u.name, u.tag, u.avatar, cm1.chatroomId
            FROM users u
            LEFT OUTER JOIN friend_list fl ON fl.userId = u.id AND fl.friendId = ?
            LEFT OUTER JOIN chatroom_members cm1 ON cm1.userId = fl.userId
            LEFT OUTER JOIN chatroom_members cm2 ON cm1.chatroomId = cm2.chatroomId 
            WHERE u.id = ?`,
        [req.session.userID, req.params.id]);

        let general = null;
        let stats = null;
        let friends = null;
        let matches = null;

        if (res.locals.visible) {
            general = await connection.query(`
                SELECT u.rankedMMR, u.createdAt, u.lastOnline, u.lastPlayed, l.ranking, l.percentile
                FROM users u
                INNER JOIN leaderboard l ON u.id = l.id
                WHERE u.id = ?`,
            [req.params.id]);

            general = general[0];
    
            stats = await connection.query(`
                SELECT matchType, gamesPlayed, wins, losses, draws, wins / gamesPlayed * 100 AS winRatio
                FROM stats
                WHERE userId = ?
            `, [req.params.id]);

            friends = await friendList(connection, friendLimit, req.params.id, req.params.id);
            matches = await matchList(connection, matchLimit, req.params.id, res.locals.relation);
        }

        res.json({ 
            visible: res.locals.visible,
            relation: res.locals.relation,  
            user, 
            general, 
            stats, 
            friends, 
            matches 
        });
    }
    catch (err) {
        next(err);
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
});

router.get("/:id/friends", isProfileVisible, async (req, res, next) => {
    const limit = Number.parseInt(req.query.limit);

    let connection = null;
    try {
        connection = await Database.getConnection();
        const [user] = await connection.query(
            `SELECT id, name, tag, avatar
             FROM users
             WHERE id = ?`,
            [req.params.id]);

        let friends = null;

        if (res.locals.visible) {
            friends = await friendList(connection, limit, req.params.id, req.params.id);
        }

        res.json({ visible: res.locals.visible, user, friends });
    }
    catch (err) {
        next(err);
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
});

router.get("/:id/matches", isProfileVisible, async (req, res, next) => {
    const limit = Number.parseInt(req.query.limit);

    let connection = null;
    try {
        connection = await Database.getConnection();
        const [user] = await connection.query(`
            SELECT id, name, tag, avatar
            FROM users
            WHERE id = ?
        `, [req.params.id]);

        let matches = null;
        if (res.locals.visible) {
            matches = await matchList(connection, limit, req.params.id, res.locals.relation);
        }

        res.json({ visible: res.locals.visible, user, matches });
    }
    catch (err) {
        next(err);
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
});

router.post("/:id/friend-requests", createFriendRequest, notifyUserOfFriendRequest);
router.post("/:id/unfriend", unfriend, notifyFriendsOfRemoval, (req, res, next) => {
    res.sendStatus(204);
});

async function checkIfUserExists(req, res, next) {
    const rows = await Database.query("SELECT id FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) {
        res.sendStatus(404);
        return;
    }

    next();
}

async function isProfileVisible(req, res, next) {
    let connection = null;
    try {
        connection = await Database.getConnection();
        const [user] = await connection.query("SELECT profilePage FROM users WHERE id = ?", [req.params.id]);

        res.locals.visible = true;

        if (req.params.id === req.session.userID) {
            res.locals.relation = "self";
            next();
            return;
        }

        if (user.profilePage === "private") {
            res.locals.visible = false;
        }

        const [friend] = await connection.query("SELECT userId, friendId FROM friend_list WHERE userId = ? AND friendId = ?", [req.session.userID, req.params.id]);
        
        if (user.profilePage === "friends only" && friend == null) {
            res.locals.visible = false;
        }

        res.locals.relation = friend ? "friend" : "stranger";

        next();
    }
    catch (err) {
        next(err);
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function friendList(connection, limit, userId, friendId) {
    try {
        return await connection.query(`
            SELECT fl1.friendId AS id, u.name, u.tag, u.avatar, if(fl2.friendId IS NULL, FALSE, TRUE) AS mutual
            FROM friend_list fl1
            INNER JOIN users u ON fl1.friendId = u.id
            LEFT OUTER JOIN (
                SELECT friendId
                FROM friend_list
                WHERE userId = ?
            ) fl2 ON fl1.friendId = fl2.friendId 
            WHERE userId = ?
            ORDER BY u.name ASC
            ${Number.isNaN(limit) || limit < 1 ? "" : "LIMIT ?"}
        `, [userId, friendId, limit]);
    }
    catch (err) {
        throw err;
    }
}

async function matchList(connection, limit, userId, relation) {
    try {
        let matches = await connection.query(`
            SELECT m.id, m.createdAt, m.duration, m.type, c1.mmrChange, c1.color, c1.score, c2.userId AS opponent
            FROM scoreboard c1
            INNER JOIN matches m ON c1.matchId = m.id
            LEFT OUTER JOIN scoreboard c2 ON c1.matchId = c2.matchId AND c1.userId <> c2.userId
            WHERE c1.userId = ? ${relation === "stranger" ? "AND m.type <> 'private'" : ""}
            ORDER BY m.createdAt DESC
            ${Number.isNaN(limit) || limit < 1 ? "" : "LIMIT ?"}
        `, [userId, limit]);
    
        matches = await addUserDataToQueryResult(connection, matches, "opponent");
        return matches;
    }
    catch (err) {
        throw err;
    }
}

async function createFriendRequest(req, res, next) {
    const senderId = req.session.userID;
    const friendId = req.params.id;

    let connection = null;

    try {
        if (friendId === senderId) {
            res.status(400).json({ error: "Can't make a friend request to yourself." });
            return;
        }

        connection = await Database.getConnection();
        if (await areFriends(connection, senderId, friendId) || await hasPendingFriendRequests(connection, senderId, friendId)) {
            res.sendStatus(204);
            return;
        }

        const notificationId = UUID();
        const createdAt = new Date();
        await connection.query(`
            INSERT INTO notifications (id, senderId, receiverId, type, createdAt) VALUES(?, ?, ?, ?, ?)
        `, [notificationId, senderId, friendId, "friend_request", createdAt]);

        res.locals.notificationId = notificationId;
        res.locals.friendId = friendId;
        res.locals.senderId = senderId;
        res.locals.createdAt = createdAt;

        next();
    }
    catch (err) {
        next(err);
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function notifyUserOfFriendRequest(req, res, next) {
    const { notificationId, friendId, senderId, createdAt } = res.locals;
    const { sse } = req.app.locals;

    const notification = {
        id: notificationId,
        sender: await UserCache.get(senderId, "id", "name", "tag", "avatar"),
        type: "friend_request",
        seen: 0,
        createdAt
    };

    const friend = sse.get(friendId);
    if (friend != null) {
        friend.write(`data: ${JSON.stringify({ type: SSE.FRIEND_REQUEST, data: { notification } })}\n\n`);
    }

    res.sendStatus(204);
}

async function areFriends(connection, userId1, userId2) {
    try {
        const rows = await connection.query(
            `SELECT *
             FROM friend_list
             WHERE userId = ? AND friendId = ?`
            , [userId1, userId2]);

        return rows.length > 0;
    }
    catch (err) {
        throw err;
    }
}

async function hasPendingFriendRequests(connection, userId1, userId2) {
    try {
        const rows = await connection.query(
            `SELECT n.id
             FROM notifications n
             WHERE (senderId = ? AND receiverId = ? OR senderId = ? AND receiverId = ?) AND type ='friend_request'`
            , [userId1, userId2, userId2, userId1]);

        return rows.length > 0;
    }
    catch (err) {
        throw err;
    }
}

async function unfriend(req, res, next) {
    const friendId = req.params.id;
    const senderId = req.session.userID;

    if (friendId === senderId) {
        res.status(400).json({ error: "You can't unfriend yourself." });
        return;
    }

    try {
        const result = await Database.query(`
            DELETE
            FROM friend_list
            WHERE userId = ? AND friendId = ? OR userId = ? AND friendId = ?
        `, [senderId, friendId, friendId, senderId]);

        if (result.affectedRows === 0) {
            res.status(400).json({ error: `You and "${friendId}" are not friends.` });
        }
        else {
            res.locals.friends = [friendId];
            next();
        }
    }
    catch (err) {
        next(err);
    }
}

export { router as default };