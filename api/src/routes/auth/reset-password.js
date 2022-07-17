import Express from "express";
import JWT from "jsonwebtoken";
import Database from "../../database.js";
import { validatePasswords, validateQueryString, validateRequestBody } from "../middlewares.js";
import { hashPassword } from "../../utils/password.js";

const router = Express.Router();

router.post("/", validateQueryString("id", "token"), validateRequestBody("password", "secondPassword"), validateToken, validatePasswords, updateUserPassword);

async function validateToken(req, res, next) {
    try {
        const [user] = await Database.query("SELECT password FROM users WHERE id = ?", [req.query.id]);
        if (!user) {
            res.status(400).json({ error: "Invalid token." });
            return;
        }

        const token = JWT.verify(req.query.token, user.password);
        res.locals.userID = token.id;
        next();
    }
    catch (err) {
        if (err instanceof JWT.JsonWebTokenError)
            res.status(400).json({ error: "Invalid token." });
        else
            next(err);
    }

}

async function updateUserPassword(req, res, next) {
    try {
        const { salt, hash } = await hashPassword(req.body.password);
        const result = await Database.query("UPDATE users SET password = ? WHERE id = ?", [Buffer.concat([salt, hash]), res.locals.userID]);
        
        if (result.affectedRows === 0) {
            res.sendStatus(404);
            return;
        }

        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
}


export { router as default };