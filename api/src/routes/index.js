import Express from "express";
import AuthRouter from "./auth/index.js";
import CommunityRouter from "./community/index.js";
import { redisSession } from "../redis-session.js";

const router = Express.Router();

router.use((req, res, next) => {
    req.url = req.url.replace(/^\/api$|^\/api\//, "/");
    next();
});
router.use(Express.json());
router.use(redisSession);
router.use("/auth", AuthRouter);
router.use("/community", CommunityRouter);
router.use("/hch", (req, res) => {
    res.sendStatus(200);
});

export { router as default };