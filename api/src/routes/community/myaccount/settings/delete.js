import Express from "express";
import Database from "../../../../database.js";
import * as UserCache from "../../../../utils/user-cache.js";
import { validateCurrentPassword, logOutUser, notifyFriendsOfRemoval } from "../../../middlewares.js";
import { returnOldTagToPool } from "../../../../utils/name-tag.js";

const router = Express.Router();

router.post("/", validateCurrentPassword, deleteUser, notifyFriendsOfRemoval, logOutUser, (req, res, next) => {
    res.sendStatus(204);
});

async function deleteUser(req, res, next) {
    const userId = req.session.userID;
    let connection = null;
    
    try {
        connection = await Database.getConnection();

        const user = connection.query("SELECT name, tag, matchIdInProgress FROM users WHERE id = ?", [userId]);
        if (user.matchIdInProgress) {
            res.status(409).json({ error: "You can't delete your account while a match is in progress." });
            return;
        }

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
        await connection.query(`
            DELETE FROM users WHERE id = ?;
        `, [userId]);
        await connection.commit();

        await returnOldTagToPool(user.name, user.tag);

        await UserCache.removeFromChatrooms(userId);
        await UserCache.remove(userId);

        res.locals.userDeleted = true;
        res.locals.friends = await UserCache.get(userId, "friends");
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


export { router as default };