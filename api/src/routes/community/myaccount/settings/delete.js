import Express from "express";
import Database from "../../../../database.js";
import * as UserCache from "../../../../utils/user-cache.js";
import { validateCurrentPassword, logOutUser, notifyFriendsOfRemoval, validateRequestBody } from "../../../middlewares.js";
import { removeFile } from "../../../../utils/file.mjs";

const router = Express.Router();

router.post("/", validateRequestBody("currentPassword"), validateCurrentPassword, deleteUser, notifyFriendsOfRemoval, logOutUser, (req, res, next) => {
    res.sendStatus(204);
});

async function deleteUser(req, res, next) {
    const userId = req.session.userID;
    let connection = null;
    
    try {
        connection = await Database.getConnection();

        const [user] = await connection.query("SELECT name, tag, avatar, matchIdInProgress FROM users WHERE id = ?", [userId]);
        if (user.matchIdInProgress) {
            res.status(409).json({ error: "You can't delete your account while a match is in progress." });
            return;
        }
        
        if (user.avatar !== "/avatars/default.png") {
            await removeFile(user.avatar, true);
        }

        res.locals.friends = await UserCache.get(userId, "friends");
        res.locals.userDeleted = true;
        await UserCache.removeFromChatrooms(userId);
        await UserCache.remove(userId);

        await connection.beginTransaction();
        await connection.query(`
            DELETE FROM stats WHERE userId = ?;
        `, [userId]);
        await connection.query(`
            DELETE FROM scoreboard WHERE userId = ?;
        `, [userId]);
        await connection.query(`
            DELETE 
            FROM received_messages 
            WHERE messageId IN (SELECT id FROM messages WHERE senderId = ?) OR userId = ?
        `, [userId, userId]);
        await connection.query(`
            DELETE FROM notifications WHERE senderId = ? OR receiverId = ?;
        `, [userId, userId]);
        await connection.query(`
            DELETE FROM messages WHERE senderId = ?;
        `, [userId]);
        await connection.query(`
            DELETE FROM friend_list WHERE userId = ? OR friendId = ?;
        `, [userId, userId]);
        await connection.query(`
            DELETE FROM chatroom_members WHERE userId = ?;
        `, [userId]);
        await removeEmptyChatrooms(connection);

        const removedMatches = await removeMatches(connection);

        await connection.query(`
            DELETE FROM users WHERE id = ?;
        `, [userId]);
        await connection.commit();

        await removeReplays(removedMatches);

        next();
    }
    catch (err) {
        if (connection) {
            await connection.rollback();
        }
        next(err);
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
}

async function removeEmptyChatrooms(db) {
    try {
        await db.query(`
            DELETE 
            FROM chatrooms
            WHERE id IN (
                SELECT id
                FROM chatrooms c
                LEFT OUTER JOIN chatroom_members cm ON c.id = cm.chatroomId
                GROUP BY id
                HAVING COUNT(chatroomId) = 0
            )
        `);
    }
    catch (err) {
        throw err;
    }
}

async function removeMatches(db) {
    try {
        const emptyMatches = await db.query(`
            SELECT id
            FROM matches m
            LEFT OUTER JOIN scoreboard s ON m.id = s.matchId
            GROUP BY id
            HAVING COUNT(matchId) = 0
        `);

        if (emptyMatches.length > 0) {
            await db.query(`
                DELETE
                FROM matches
                WHERE id IN (${emptyMatches.map(match => "?").join(", ")})
            `, emptyMatches.map(match => match.id));
        }
        
        return emptyMatches;
    }
    catch (err) {
        throw err;
    }
}

async function removeReplays(matches) {
    try {
        if (matches.length > 0) {
            await Promise.all(matches.map(match => removeFile(`/replays/${match.id}.json`)));
        }
    }
    catch (err) {
        throw err;
    }
}


export { router as default };