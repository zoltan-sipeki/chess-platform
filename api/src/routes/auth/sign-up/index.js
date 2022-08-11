import Express from "express";
import Database from "../../../database.js";
import { sendEmail } from "../../../mailer.js";
import JWT from "jsonwebtoken";
import { JWTOptions } from "../../../utils/jwt-options.js";
import { validateRequestBody } from "../../middlewares.js";
import { validateProfileName, validateEmail } from "../../../../../common/validators.mjs";
import { AES128Encrypt } from "../../../utils/encrypt.js";
import * as Constants from "../../../../../common/validator-constants.mjs";

import FinishSignUpRoute from "./complete.js";
import { generateTag } from "../../../utils/name-tag.js";
import { signUpEmail } from "../../../utils/emails.js";

const router = Express.Router();

router.use("/complete", FinishSignUpRoute);
router.post("/", validateRequestBody("name", "email"), validateInputs, sendVerificationEmail);

async function validateInputs(req, res, next) {
    const { name, email } = req.body;

    const errorResponse = {
        name: {},
        email: {}
    };

    errorResponse.name.error = validateProfileName(name);
    if (errorResponse.name.error !== Constants.NO_ERROR) {
        if (await generateTag(name) === -1) {
            errorResponse.name.error = Constants.ERROR_TOO_MANY_NAMES;
        }
    }
    errorResponse.email.error = validateEmail(email); 

    try {
        if (errorResponse.email.error === Constants.NO_ERROR) {
            const user = await Database.query("SELECT email FROM users WHERE email = ?", [email]);
            if (user.length > 0)
                errorResponse.email.error = Constants.ERROR_EMAIL_ADDRESS_ALREADY_TAKEN;
        }

        for (const input in errorResponse) {
            if (errorResponse[input].error !== Constants.NO_ERROR) {
                res.status(400).json(errorResponse);
                return;
            }
        }
        next();
    }
    catch (err) {
        next(err);
    }
}

async function sendVerificationEmail(req, res, next) {
    try {
        const emailEncrypted = AES128Encrypt(req.body.email);
        const token = JWT.sign({ name: req.body.name, email: emailEncrypted }, process.env.JWT_SECRET_KEY, JWTOptions);

        const link = `${req.protocol}://${process.env.PROXY_HOST}/auth/sign-up/complete?token=${token}`;
        
        const email = signUpEmail(req.body.name, link);
        sendEmail(req.body.email, email.subject, email.html);

        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
}

export { router as default };