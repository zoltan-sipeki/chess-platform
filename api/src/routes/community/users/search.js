import Express from "express";
import Database from "../../../database.js";
import { validateQueryString } from "../../middlewares.js";

const router = Express.Router();

router.get("/", validateQueryString("name"), async (req, res, next) => {
    if (req.query.name.length === 0) {
        res.sendStatus(400);
        return;
    }

    const limit = Number.parseInt(req.query.limit);

    try {
        const searchTerm = decodeURIComponent(req.query.name);
        const users = await Database.query(`
            SELECT id, name, tag, avatar 
            FROM users 
            WHERE name LIKE ? 
            ORDER BY name, tag 
            ${Number.isNaN(limit) || limit < 1 ?  "" : "LIMIT ?"}
        `, [`%${searchTerm}%`, limit]);
        res.json(users);
    }
    catch (err) {
        next(err);
    }

});

export { router as default };