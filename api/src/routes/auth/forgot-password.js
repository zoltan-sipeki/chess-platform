import Express from "express";
import JWT from "jsonwebtoken";
import { JWTOptions } from "../../utils/jwt-options.js";
import Database from "../../database.js";
import Mailer from "../../mailer.js";
import { validateRequestBody } from "../middlewares.js";
import { forgotPasswordEmail } from "../../utils/emails.js";

const router = Express.Router();

router.post("/", validateRequestBody("email"), validateEmail, sendPasswordResetLink);

async function validateEmail(req, res, next) {
    try {
        const [user] = await Database.query("SELECT name, id, password FROM users WHERE email = ?", [req.body.email]);
        if (!user) {
            res.sendStatus(204);
            return;
        }
        
        res.locals.name = user.name;
        res.locals.payload = { id: user.id };
        res.locals.secret = user.password;
        next();
    }
    catch (err) {
        next(err);
    }
}

async function sendPasswordResetLink(req, res, next) {
    try {
        const token = JWT.sign(res.locals.payload, res.locals.secret, JWTOptions);
        const link = `http://${process.env.PROXY_HOST}/auth/reset-password?id=${res.locals.payload.id}&token=${token}`;

        const email = forgotPasswordEmail(res.locals.name, link);

        Mailer.sendMail({
            from: process.env.SMTP_USER,
            to: req.body.email,
            subject: email.subject,
            html: email.html
        })

        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
}

export { router as default };