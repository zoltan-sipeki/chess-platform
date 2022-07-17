import Express from "express";
import Database from "../../../../database.js";
import FileType from "file-type";
import { v4 as UUID } from "uuid";
import { notifyFriendsOfUpdate } from "../../../middlewares.js";
import { writeFile, removeFile } from "../../../../utils/file.mjs";

const AVATAR_SIZE_LIMIT = 5242880;
const AVATARS_FOLDER = "/avatars";
const DEFAULT_AVATAR = `${AVATARS_FOLDER}/default.png`;;

const router = Express.Router();

router.post("/upload", Express.raw({ type: "image/png", limit: AVATAR_SIZE_LIMIT }), uploadAvatar, notifyFriendsOfUpdate, (req, res, next) => {
    res.json(res.locals.changes);
});

async function uploadAvatar(req, res, next) {
    if (!req.is("image/png")) {
        res.status(415).json({ error: "Supported image types: \"image/png\"" });
        return;
    }

    const fileType = await FileType.fromBuffer(req.body);
    if (fileType.ext !== "png") {
        res.status(415).json({ error: "Supported image types: \"image/png\"" });
        return;
    }

    const avatar = `${AVATARS_FOLDER}/${UUID()}.png`;
    await writeFile(avatar, "image/png", req.body, true);
    
    let connection = null;

    try {
        connection = await Database.getConnection();
        const [user] = await connection.query("SELECT avatar FROM users WHERE id = ?", [req.session.userID]);

        if (user.avatar !== DEFAULT_AVATAR) {
            await removeFile(user.avatar, true);
        }

        await connection.query("UPDATE users SET avatar = ? WHERE id = ?", [avatar, req.session.userID]);

        res.locals.changes = { avatar };

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


router.post("/remove", removeAvatar, notifyFriendsOfUpdate, (req, res, next) => {
    res.json(res.locals.changes)
});

async function removeAvatar(req, res, next) {
    let connection = null;

    try {
        connection = await Database.getConnection();

        const [user] = await connection.query("SELECT avatar FROM users WHERE id = ?", [req.session.userID]);
        if (user.avatar !== DEFAULT_AVATAR) {
            await removeFile(user.avatar, true);
            await connection.query("UPDATE users SET avatar = ? WHERE id = ?", [DEFAULT_AVATAR, req.session.userID]);
        }

        res.locals.changes = { avatar: DEFAULT_AVATAR };
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