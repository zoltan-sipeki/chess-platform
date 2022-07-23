import Express from "express";
import Database from "../../database.js";
import { comparePasswords } from "../../utils/password.js";
import { validateRequestBody } from "../middlewares.js";
import { redis } from "../../redis.js";

const router = Express.Router();

router.post("/", validateRequestBody("email", "password"), validateUserCredentials, logInUser);

async function validateUserCredentials(req, res, next) {
    try {
        const [user] = await Database.query("SELECT id, password FROM users WHERE email = ?", [req.body.email]);

        if (!user) {
            res.status(401).json({ error: "Invalid username or password." });
            return;
        }

        if (!await comparePasswords(req.body.password, user.password)) {
            res.status(401).json({ error: "Invalid username or password." });
            return;
        }

        res.locals.userID = user.id;
        next();
    }
    catch (err) {
        next(err);
    }
}

async function logInUser(req, res, next) {
    req.session.userID = res.locals.userID;
    res.cookie("loggedIn", true, {
        httpOnly: false,
        sameSite: true
    });
    await redis.v4.set(`sess-user:${req.session.id}`, req.session.userID);
    await redis.v4.rPush(`active-sessions:${req.session.userID}`, req.session.id);
    res.sendStatus(204);
}

export { router as default };