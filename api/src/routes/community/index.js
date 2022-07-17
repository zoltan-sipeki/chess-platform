import Express from "express";
import { isAuthenticated } from "../middlewares.js";
import MyAccountRoute from "./myaccount/index.js";
import UsersRoute from "./users/index.js";
import EventsRoute from "./events.js";
import SignOutRoute from "./sign-out.js";

const router = Express.Router();

router.use(isAuthenticated);
router.use("/myaccount", MyAccountRoute);
router.use("/users", UsersRoute);
router.use("/events", EventsRoute);
router.use("/sign-out", SignOutRoute);

export { router as default };