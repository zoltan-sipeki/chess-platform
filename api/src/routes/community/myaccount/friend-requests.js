import Express from "express";
import Database from "../../../database.js";
import { v4 as UUID } from "uuid";
import * as UserCache from "../../../utils/user-cache.js";
import * as SSE from "../../../utils/sse-messages-types.mjs";

const router = Express.Router();

router.post("/:id/accept", acceptFriendRequest, notifyFriendOfAcceptedFriendRequest);

async function acceptFriendRequest(req, res, next) {
    const senderId = req.session.userID;
    const friendRequestId = req.params.id;

    let connection = null;
    try {
        connection = await Database.getConnection();
        const [[friendId]] = await connection.query({
            rowsAsArray: true,
            sql: `SELECT senderId FROM notifications WHERE id = ? AND receiverId = ?`
        }, [req.params.id, req.session.userID]);

        if (friendId == null) {
            res.status(400).json({ error: "Invalid friend request ID" });
            return;
        }

        await connection.beginTransaction();
        await connection.query(`
            DELETE
            FROM notifications
            WHERE id = ? AND receiverId = ?
        `, [friendRequestId, senderId]);

        await connection.batch(`
            INSERT INTO friend_list (userId, friendId) VALUES (?, ?)
        `, [[senderId, friendId], [friendId, senderId]]);


        const notificationId = UUID();
        const createdAt = new Date();
        await connection.query(`
            INSERT INTO notifications (id, senderId, receiverId, type, createdAt) VALUES (?, ?, ?, ?, ?)
        `, [notificationId, senderId, friendId, "friend_request_accepted", createdAt]);

        const chatroomId = await createChatRoom(connection, senderId, friendId);
        await connection.commit();

        res.locals.chatroomId = chatroomId;
        res.locals.notificationId = notificationId;
        res.locals.friendId = friendId;
        res.locals.createdAt = createdAt;

        next();
    }
    catch (err) {
        await connection.rollback();
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            console.error(err);
            res.status(400).json({ error: "Invalid friend ID" });
        }
        else {
            next(err);
        }
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function notifyFriendOfAcceptedFriendRequest(req, res, next) {
    const senderId = req.session.userID;
    const { notificationId, chatroomId, friendId, createdAt } = res.locals;
    const { sse } = req.app.locals;

    const notification = {
        id: notificationId,
        sender: await UserCache.get(senderId, "id", "name", "tag", "avatar"),
        type: "friend_request_accepted",
        createdAt
    };

    await UserCache.addFriend(senderId, friendId);
    await UserCache.addFriend(friendId, senderId);
    await UserCache.addChatroom(senderId, chatroomId);
    await UserCache.addChatroom(friendId, chatroomId);

    let friend = sse.get(friendId);
    if (friend != null) {
        const sender = await UserCache.get(senderId, "id", "name", "tag,", "avatar", "lastOnline", "status", "statusText");
        sender.chatroomId = chatroomId;
        friend.write(`data: ${JSON.stringify({ type: SSE.FRIEND_REQUEST_ACCEPTED, data: { notification, friend: sender } })}\n\n`);
    }

    friend = await UserCache.get(friendId, "id", "name", "tag", "avatar", "lastOnline", "status", "statusText");
    friend.chatroomId = chatroomId;

    res.json({ friend });
}

router.post("/:id/reject", async (req, res, next) => {
    try {
        const result = await Database.query(`
            DELETE
            FROM notifications
            WHERE id = ? AND receiverId = ?
        `, [req.params.id, req.session.userID]);

        if (result.affectedRows === 0) {
            res.status(400).json({ error: "Invalid friend request ID" });
            return;
        }
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
});

async function createChatRoom(connection, userId1, userId2) {
    try {
        const rows = await connection.query(`
            SELECT c1.chatroomId
            FROM chatroom_members c1
            INNER JOIN chatroom_members c2 ON c1.chatroomId = c2.chatroomId
            WHERE c1.userId = ? AND c2.userId = ? AND c1.chatroomId = c2.chatroomId
        `, [userId1, userId2]);

        if (rows.length > 0) {
            return rows[0].chatroomId;
        }

        const id = UUID();
        await connection.query(`INSERT INTO chatrooms (id) VALUES (?)`, [id]);
        await connection.batch(`INSERT INTO chatroom_members (chatroomId, userId) VALUES (?, ?)`, [[id, userId1], [id, userId2]]);

        return id;
    }
    catch (err) {
        throw err;
    }
}

export { router as default };