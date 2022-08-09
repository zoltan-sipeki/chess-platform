import Express from "express";
import { validateEmail } from "../../../../../../common/validators.mjs";
import { sendEmail } from "../../../../mailer.js";
import Database from "../../../../database.js";
import { validateRequestBody, validateCurrentPassword } from "../../../middlewares.js";
import * as Constants from "../../../../../../common/validator-constants.mjs";
import { changeEmailEmail } from "../../../../utils/emails.js";

const router = Express.Router();

router.post("/", validateRequestBody("email", "currentPassword"),
                 validateCurrentPassword,
                 updatEmail,
                 sendVerificationEmail);

async function updatEmail(req, res, next) {
    const { email } = req.body;
    
    let error = validateEmail(email);
    if (error) {
        res.status(400).json({ error });
        return;
    }
    
    let connection = null;
    try {
        connection = await Database.getConnection();
        const [user] = await connection.query(`SELECT name, email FROM users WHERE id = ?`, [req.session.userID]);

        await connection.query("UPDATE users SET email = ? WHERE id = ?", [email, req.session.userID]);
        
        res.locals.oldEmail = user.email;
        res.locals.name = user.name;
        next();
    }
    catch (err) {
        if (err.code === "ER_DUP_ENTRY") {
            res.status(400).json({ error: Constants.ERROR_EMAIL_ADDRESS_ALREADY_TAKEN });
        }
        else {
            next(err);
        }
    }
    finally {
        if (connection) {
            await connection.end();
        }
    }
}

function sendVerificationEmail(req, res, next) {        
    const email = changeEmailEmail(res.locals.name, req.body.email);
    sendEmail(res.locals.oldEmail, email.subject, email.html);
    
    res.json({ email: req.body.email });
}

export { router as default };