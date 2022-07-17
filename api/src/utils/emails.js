import { JWTOptions } from "./jwt-options.js";

export function signUpEmail(name, link) {
    return {
        subject: "Verify registration",
        html: `
            <h3>Dear ${name}, </h3>
            <p>Thank you for joining our site.</p>
            <p>In order to complete your registration, please click the following link:</p>
            <a href="${link}">${link}</a>
            <p>The link will be avalable for ${JWTOptions.expiresIn}. After it has expired, you will need to re-register.</p>
            <p>If this e-mail was sent to you by mistake, please ignore or delete it.</p>
            <br>
            <p>Yours sincerely,</p>
            <p>Chess Platform</p>
        `
    };
}

export function forgotPasswordEmail(name, link) {
    return {
        subject: "Forgotten password",
        html: `
            <h3>Dear ${name}, </h3>
            <p>As per your request, we are sending you the link where you can reset your password:</p>
            <a href="${link}">${link}</a>
            <p>The link will be available for ${JWTOptions.expiresIn}. After it has expired, you'll need to ask for another one.</p>
            <p>If it was not you that initiated the request, please ignore or delete this e-mail.</p>
            <br>
            <p>Yours sincerely,</p>
            <p>Chess Platform</p>
        `
    };
}

export function changeEmailEmail(name, newEmail) {
    return {
        subject: "Your e-mail has been changed",
        html: `
            <h3>Dear ${name},</h3>
            <p>We would like to let you know that your e-mail has been changed to <strong>${newEmail}</strong>.</p>
            <br>
            <p>Your sincerely,</p>
            <p>Chess Platform</p>
        `
    };
}

export function changePasswordEmail(name) {
    return {
        subject: "Your password has been changed",
        hhtml: `
            <h3>Dear ${name},</h3>
            <p>We would like to let you know that your password has been changed.</p>
            <br>
            <p>Your sincerely,</p>
            <p>Chess Platform</p>
        `
    };
}