import Express from "express";
import Database from "../../database.js";

const router = Express.Router();

router.get("/", async (req, res, next) => {
    try {
        const limit = Number.parseInt(req.query.limit);
        const leaderboard = await Database.query(`
            SELECT * 
            FROM leaderboard
            ${Number.isNaN(limit) || limit < 1 ? "" : "LIMIT ?"}
        `, [limit]);
        res.json(leaderboard);
    }
    catch (err) {
        next(err);
    }
});

export { router as default };