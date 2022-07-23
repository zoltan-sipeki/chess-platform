import Express from "express";
import { logOutUser, isAuthenticated } from "../middlewares.js";

const router = Express.Router();

router.post("/", isAuthenticated, logOutUser, (req, res, next) => {
    res.sendStatus(204);
});

export { router as default };