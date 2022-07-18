import { DB } from "./database.js";

export async function save(chatroomId, messageId, text, createdAt, senderId) {
    let connection = null;
    try {
        connection = await DB.getConnection();
        await connection.beginTransaction();
        await connection.query(
            `INSERT INTO messages (id, senderId, text, createdAt, chatroomId) VALUES(?, ?, ?, ?, ?)`
            , [messageId, senderId, text, createdAt, chatroomId]);

        const members = await connection.query(`
                SELECT userId
                FROM chatroom_members
                WHERE chatroomId = ?`
            , [chatroomId]);

        await connection.batch(
            `INSERT INTO received_messages(userId messageId, seen) VALUES(?, ?, ?, ?)`
            , members.map(member => [member.userId, messageId, member.userId === senderId ? 1 : 0]));

        await connection.commit();
    }
    catch (err) {
        console.error(err);
        await connection.rollback();
    }
    finally {
        await connection.end();
    }
}

export async function setSeen(messageId, senderId) {
    try {
        await DB.query(`
            UPDATE received_messages
            SET seen = TRUE
            WHERE userId = ? AND messageId = ?`
            , [senderId, messageId]);
    }
    catch (err) {
        console.error(err);
    }
}
