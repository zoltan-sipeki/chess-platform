import Express from "express";
import UploadAvatarRoute from "./avatar.js";
import ChangeUserNameRoute from "./name.js";
import ChangeEmailRoute from "./email.js";
import PasswordRoute from "./password.js";
import ChangeProfilePageVisibilityRoute from "./profile.js";
import DeleteAccountRoute from "./delete.js";

const router = Express.Router();

router.use("/avatar", UploadAvatarRoute);
router.use("/name", ChangeUserNameRoute);
router.use("/email", ChangeEmailRoute);
router.use("/password", PasswordRoute);
router.use("/profile", ChangeProfilePageVisibilityRoute);
router.use("/delete", DeleteAccountRoute);

export { router as default };