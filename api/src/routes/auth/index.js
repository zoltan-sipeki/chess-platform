import Express from "express";
import SignUpRoute from "./sign-up/index.js";
import ForgotPasswordRoute from "./forgot-password.js";
import ResetPasswordRoute from "./reset-password.js";
import SignInRoute from "./sign-in.js";

const router = Express.Router();

router.use("/sign-up", SignUpRoute);
router.use("/sign-in", SignInRoute);
router.use("/forgot-password", ForgotPasswordRoute);
router.use("/reset-password", ResetPasswordRoute);

export { router as default };