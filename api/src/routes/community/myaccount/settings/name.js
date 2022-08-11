import Express from "express";
import Database from "../../../../database.js";
import { validateProfileName } from "../../../../../../common/validators.mjs";
import { generateTag } from "../../../../utils/name-tag.js";
import { notifyFriendsOfUpdate, validateRequestBody } from "../../../middlewares.js";
import { ERROR_TOO_MANY_NAMES } from "../../../../../../common/validator-constants.mjs";

const router = Express.Router();

router.post("/", validateRequestBody("name"), updateUserName, notifyFriendsOfUpdate, (req, res, next) => {
    res.json(res.locals.changes);
});

async function updateUserName(req, res, next) {
    const { name } = req.body;

    let error = validateProfileName(name);
    if (error) {
        res.status(400).json({ error });
        return;
    }

    let connection = null;
    try {
        connection = await Database.getConnection();
        const [user] = await connection.query("SELECT name, tag FROM users WHERE id = ?", [req.session.userID]);

        if (user.name === name) {
            res.json({ name: user.name, tag: user.tag });
            return;
        }

        const tag = await generateTag(name);

        if (tag === -1) {
            res.json({ error: ERROR_TOO_MANY_NAMES });
            return;
        }

        await connection.query("UPDATE users SET name = ?, tag = ? WHERE id = ?", [name, tag, req.session.userID]);

        res.locals.changes = { name, tag };
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

export { router as default };