import Nodemailer from "nodemailer";

const mailer = Nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    secure: false
});

export async function sendEmail(to, subject, html) {
    await mailer.sendMail({
        from: process.env.SMTP_FROM,
        to,
        subject,
        html
    });
}