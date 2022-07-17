import Express from "express";
import Database from "../../../../database.js";
import { hashPassword } from "../../../../utils/password.js";
import { validateCurrentPassword, validatePasswords, validateRequestBody } from "../../../middlewares.js";
import Mailer from "../../../../mailer.js";
import { changePasswordEmail } from "../../../../utils/emails.js";

const router = Express.Router();

router.post("/", validateRequestBody("password", "secondPassword", "currentPassword"),
                 validateCurrentPassword, 
                 validatePasswords, 
                 updatePassword,
                 sendEmail);

async function updatePassword(req, res, next) {
    let connection = null;
    try {
        const { salt, hash } = await hashPassword(req.body.password);

        connection = await Database.getConnection();
        await connection.query("UPDATE users SET password = ? WHERE id = ?", [Buffer.concat([salt, hash]), req.session.userID]);
        const [user] = await connection.query("SELECT name, email FROM users WHERE id = ?", [req.session.userID]);

        res.locals.name = user.name;
        res.locals.email = user.email;
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

function sendEmail(req, res, next) {
    const email = changePasswordEmail(res.locals.name);

    Mailer.sendMail({
        from: process.env.SMTP_USER,
        to: res.locals.email,
        subject: email.subject,
        html: email.html
    });

    res.sendStatus(204);
}
export { router as default };