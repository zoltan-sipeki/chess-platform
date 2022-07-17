import Dotenv from "dotenv";
import { mypath } from "../../common/utils.mjs";

Dotenv.config({ path: mypath(import.meta.url, "../.env") });