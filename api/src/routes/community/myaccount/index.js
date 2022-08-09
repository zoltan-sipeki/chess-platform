import Express from "express";
import SettingsRoute from "./settings/index.js";
import FriendRequestsRoute from "./friend-requests.js";
import NotificationsRoute from "./notifications.js";
import MessagesRoute from "./messages.js";
import Database from "../../../database.js";
import { addUserDataToQueryResult } from "../../../utils/misc.js";

const router = Express.Router();

router.use("/settings", SettingsRoute);
router.use("/friend-requests", FriendRequestsRoute);
router.use("/notifications", NotificationsRoute);
router.use("/messages", MessagesRoute);

router.get("/", async (req, res, next) => {
    let connection = null;
    try {
        connection = await Database.getConnection();
        const [user] = await connection.query(`
            SELECT id, name, tag, email, avatar, profilePage, defaultStatus AS status, matchIdInProgress
            FROM users 
            WHERE id = ?
        `, [req.session.userID]);

        let notifications = await connection.query(`
            SELECT n.id, senderId AS sender, type, n.createdAt, seen
            FROM notifications n
            INNER JOIN users u ON n.senderId = u.id
            WHERE receiverId = ? AND removed = FALSE
        `, [req.session.userID]);

        notifications = await addUserDataToQueryResult(connection, notifications, "sender");

        let friendRequests = await connection.query(`
            SELECT n.id, senderId AS sender
            FROM notifications n
            INNER JOIN users u ON n.senderId = u.id
            WHERE receiverId = ? AND type = ?
        `, [req.session.userID, "friend_request"]);

        friendRequests = await addUserDataToQueryResult(connection, friendRequests, "sender");

        const friends = await connection.query(`
            SELECT u.id, u.name, u.tag, u.avatar, u.lastOnline, u.status, u.statusText, cm1.chatroomId
            FROM friend_list fl
            INNER JOIN users u ON u.id = fl.friendId
            INNER JOIN chatroom_members cm1 ON cm1.userId = fl.friendId 
            INNER JOIN chatroom_members cm2 ON cm1.chatroomId = cm2.chatroomId
            WHERE fl.userId = ? AND cm2.userId = ?
            ORDER BY u.name, u.tag DESC
        `, [req.session.userID, req.session.userID]);

        const messageTabs = await getMessageTabs(connection, req.session.userID);

        res.json({ user, notifications, friendRequests, friends, messageTabs });
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

async function getMessageTabs(connection, userId) {
    const messageTabs = await connection.query(`
        SELECT chatroomId, COUNT(chatroomId) AS unread
        FROM received_messages rm
        INNER JOIN messages m ON rm.messageId = m.id
        WHERE userId = ? AND seen = FALSE 
        GROUP BY chatroomId
    `, [userId]);

    if (messageTabs.length === 0) {
        return [];
    }

    const partners = await connection.query(
        `SELECT u.id, u.name, u.tag, u.avatar, u.lastOnline, u.status, u.statusText, cm.chatroomId
         FROM users u
         INNER JOIN chatroom_members cm ON u.id = cm.userId
         WHERE cm.userId <> ? AND cm.chatroomId IN (${messageTabs.map(tab => "?").join(", ")})`
        , [userId, ...messageTabs.map(tab => tab.chatroomId)]);


    for (const messageTab of messageTabs) {
        messageTab.partner = partners.find(partner => partner.chatroomId === messageTab.chatroomId);
    }

    return messageTabs;
}

export { router as default };