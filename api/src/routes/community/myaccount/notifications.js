import Express from "express";
import Database from "../../../database.js";

const router = Express.Router();

router.post("/:id/see", async (req, res, next) => {
    try {
        const result = await Database.query(`
            UPDATE notifications
            SET seen = TRUE
            WHERE id = ? AND receiverId = ?
        `, [req.params.id, req.session.userID]);

        if (result.affectedRows === 0) {
            res.status(400).json({ error: "Invalid notification ID" });
            return;
        }
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
});

router.post("/:id/remove", async (req, res, next) => {
    let connection = null;
    try {
        connection = await Database.getConnection();
        const result = await connection.query(`
            SELECT type
            FROM notifications
            WHERE id = ? AND receiverId = ?
        `, [req.params.id, req.session.userID]);

        if (result.length === 0) {
            res.status(400).json({ error: "Invalid notification ID" });
            return;
        }

        if (result[0].type === "friend_request") {
            await connection.query(`
                UPDATE notifications
                SET removed = TRUE
                WHERE id = ?
            `, [req.params.id]);
        }
        else {
            await connection.query(`
                DELETE FROM
                notifications
                WHERE id = ?
            `, [req.params.id]);
        }

        res.sendStatus(204);
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

export { router as default };