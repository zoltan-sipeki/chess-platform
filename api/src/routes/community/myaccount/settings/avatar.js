import Express from "express";
import Database from "../../../../database.js";
import FileType from "file-type";
import { v4 as UUID } from "uuid";
import FS from "fs/promises";
import { mypath, writeFile } from "../../../../../../common/utils.mjs";
import { notifyFriendsOfUpdate } from "../../../middlewares.js";

const AVATAR_SIZE_LIMIT = 5242880;
const PUBLIC_FOLDER = "../../../../../../public";
const DEFAULT_AVATAR = "/avatars/default.png";

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

    const avatar = `/avatars/${UUID()}.png`;
    await writeFile(mypath(import.meta.url, PUBLIC_FOLDER), avatar.substring(1), req.body);
    
    let connection = null;

    try {
        connection = await Database.getConnection();
        const [user] = await connection.query("SELECT avatar FROM users WHERE id = ?", [req.session.userID]);

        if (user.avatar !== DEFAULT_AVATAR) {
            await FS.rm(mypath(import.meta.url, `${PUBLIC_FOLDER}${user.avatar}`));
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
    req.json(res.locals.changes)
});

async function removeAvatar(req, res, next) {
    let connection = null;

    try {
        connection = await Database.getConnection();

        const [user] = await connection.query("SELECT avatar FROM users WHERE id = ?", [req.session.userID]);
        if (user.avatar !== DEFAULT_AVATAR) {
            await FS.rm(mypath(import.meta.url, `${PUBLIC_FOLDER}${user.avatar}`));
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