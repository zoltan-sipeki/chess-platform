import Express from "express";
import { isAuthenticated } from "../middlewares.js";
import MatchesRoute from "./matches.js";
import LeaderboardRoute from "./leaderboard.js";

const router = Express.Router();

router.use("/", isAuthenticated);
router.use("/matches", MatchesRoute);
router.use("/leaderboard", LeaderboardRoute);

export { router as default };