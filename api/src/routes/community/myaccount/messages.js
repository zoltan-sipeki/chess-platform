import Express from "express";
import Database from "../../../database.js";
import { addUserDataToQueryResult } from "../../../utils/misc.js";

const router = Express.Router();

router.get("/:id", validateChatRoomId,  async (req, res, next) => {
    const page = Number.parseInt(req.query.page);
    const size = Number.parseInt(req.query.size);

    let connection = null;
    try {
        connection = await Database.getConnection();
        let offset = NaN;
        let limit = NaN;
        let result = null;

        if (Number.isNaN(page) && Number.isNaN(size)) {
            result = await loadMessages(connection, req.params.id, offset, limit, req.session.userID);
            res.json(result);
            return;
        }
        
        const [[messageCount]] = await connection.query({
            rowsAsArray: true,
            sql: `SELECT COUNT(*) FROM messages WHERE chatroomId = ?`
        }, [req.params.id])

        if (page > 0 && page <= Math.ceil(messageCount / size)) {
            offset = messageCount - page * size;
            limit = size;
            if (offset < 0) {
                limit += offset;
                offset = 0;
            }
            result = await loadMessages(connection, req.params.id, offset, limit, req.session.userID);
        }
        else {
            result = [];
        }

        res.json(result);
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

router.get("/:id/tab", validateChatRoomId, async (req, res, next) => {
    const [tab] = await Database.query(`
        SELECT u.id, u.name, u.tag, u.avatar, u.lastOnline, u.status, u.statusText
        FROM users u
        INNER JOIN chatroom_members cm ON u.id = cm.userId 
        WHERE cm.userId <> ? AND cm.chatroomId = ?
    `, [req.session.userID, req.params.id]);

    res.json(tab);
});

async function validateChatRoomId(req, res, next) {
    const chatroomQuery = await Database.query(`
        SELECT chatroomId
        FROM chatroom_members
        WHERE chatroomId = ? AND ? IN ( SELECT userId FROM chatroom_members WHERE chatroomId = ? )
    `, [req.params.id, req.session.userID, req.params.id]);

    if (chatroomQuery.length > 0) {
        next();
        return;
    }

    res.sendStatus(404);
}

async function loadMessages(connection, chatroomId, offset, limit, userId) {
    try {
        let messages = await connection.query(`
            SELECT m.id, m.senderId AS sender, m.createdAt, m.text, rm.seen
            FROM messages m
            LEFT OUTER JOIN received_messages rm ON m.id = rm.messageId AND rm.userId = ?
            WHERE m.chatroomId = ?
            ORDER BY m.createdAt ASC
            ${Number.isNaN(offset) || Number.isNaN(limit) ? "" : "LIMIT ?, ?" }
        `, [userId, chatroomId, offset, limit]);

        messages = await addUserDataToQueryResult(connection, messages, "sender");

        await connection.query(`
            UPDATE received_messages
            SET seen = TRUE
            WHERE userId = ? AND seen = FALSE
        `, [userId]);

        return messages;
    }
    catch (err) {
        throw err;
    }
}

export { router as default };