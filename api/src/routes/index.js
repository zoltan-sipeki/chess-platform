import Express from "express";
import AuthRouter from "./auth/index.js";
import CommunityRouter from "./community/index.js";
import ChessRoute from "./chess/index.js";
import { redisSession } from "../redis-session.js";

const router = Express.Router();

router.use(Express.json());
router.use(redisSession);
router.use("/auth", AuthRouter);
router.use("/community", CommunityRouter);
router.use("/chess", ChessRoute);

export { router as default };