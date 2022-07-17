import Express from "express";
import JWT from "jsonwebtoken";
import { v4 as UUID } from "uuid";
import Database from "../../../database.js";
import { hashPassword } from "../../../utils/password.js";
import { validatePasswords, validateQueryString } from "../../middlewares.js";
import { generateTag } from "../../../utils/name-tag.js";
import { AES128Decrypt } from "../../../utils/encrypt.js";
import { ERROR_TOO_MANY_NAMES } from "../../../../../common/validator-constants.mjs";

const router = Express.Router();

router.post("/", validateQueryString("token"), validateToken, validatePasswords, insertUserIntoDatabase);

async function validateToken(req, res, next) {
    try {
        const token = JWT.verify(req.query.token, process.env.JWT_SECRET_KEY);
        const email = AES128Decrypt(token.email);
        
        res.locals.name = token.name;
        res.locals.email = email;
        next();
    }
    catch (err) {
        if (err instanceof JWT.JsonWebTokenError) {
            res.status(400).json({ error: "Invalid token." });
        }
        else
            next(err);
    }
}

async function insertUserIntoDatabase(req, res, next) {
    const { password } = req.body;
    const { name, email } = res.locals;
        
    try {
        const { hash, salt } = await hashPassword(password);
        const tag = await generateTag(name);

        if (tag === -1) {
            res.status(400).json({ error: ERROR_TOO_MANY_NAMES });
            return;
        }

        await Database.query("INSERT INTO users (id, name, tag, password, email) VALUES (?, ?, ?, ?, ?)", 
            [UUID(), name, tag, Buffer.concat([salt, hash]), email]);

        res.sendStatus(201);
    }
    catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(400).json({ error: "E-mail address has already been taken. " });
        }
        else {
            next(err);
        }
    }
}

export { router as default };