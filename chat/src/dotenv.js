import Dotenv from "dotenv";
import Path from "path";
import URL from "url";

Dotenv.config({ path: Path.resolve(Path.dirname(URL.fileURLToPath(import.meta.url)), "../.env") });
