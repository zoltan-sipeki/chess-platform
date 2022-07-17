import Express from "express";
import { validateRequestBody } from "../../../middlewares.js";
import Database from "../../../../database.js";

const router = Express.Router();

router.post("/", validateRequestBody("profilePage"), async (req, res, next) => {
    try {
        const { profilePage } = req.body;
        await Database.query("UPDATE users SET profilePage = ? WHERE id = ?", [profilePage, req.session.userID]);
        res.json({ profilePage });
    }
    catch (err) {
        if (err.code === "ER_NO_REFERENCED_ROW_2") {
            res.status(400).json({ error: "Invalid option"});
        }
        else {
            next(err);
        }
    }
});

export { router as default };