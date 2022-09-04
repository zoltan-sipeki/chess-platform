import "./dotenv.js";
import Express from "express";
import FS from "fs/promises";
import { mypath } from "../../common/utils.mjs";

const argv = process.argv;

if (argv[2] !== "frontend" && argv[2] !== "static") {
    console.error("First argument must be either \"frontend\" or \"static\".");
    process.exit(1);
}

const ROOT_FOLDER = argv[2] === "frontend" ? "../public" : "../data";

const app = Express();

app.disable("x-powered-by");
app.set("trust proxy", true);

app.get("/hch", (req, res) => {
    res.sendStatus(200);
});

app.put(/\/.*/, Express.raw({ type: "image/png", limit: "10mb" }), Express.text({ type: ["application/json", "text/*"] }), async (req, res, next) => {
    const tokens = req.url.split("/");
    const file = tokens[tokens.length - 1];
    
    if (file === "") {
        res.status(400).json({ error: "File name is missing." });
        return;
    }
    
    tokens.pop();
    const folderPath = mypath(import.meta.url, `${ROOT_FOLDER}${tokens.join("/")}`);
    const filePath = `${folderPath}/${file}`;

    try {
        await FS.mkdir(folderPath, { recursive: true });
        await FS.writeFile(filePath, req.body);
        res.sendStatus(204);
    }
    catch (err) {
        if (err.code === "EEXIST") {
            await FS.writeFile(filePath, req.body);
            res.sendStatus(204);
        }
        else {
            next(err);
        }
    }
});

app.delete(/\/.*/, async (req, res, next) => {
    try {
        await FS.rm(mypath(import.meta.url, `${ROOT_FOLDER}${req.url}`));
        res.sendStatus(204);
    }
    catch (err) {
        next(err);
    }
});

const root = mypath(import.meta.url, ROOT_FOLDER);

if (argv[2] === "frontend") {
    app.use(Express.static(root), async (req, res, next) => {
        try {
            const html = await FS.readFile(mypath(import.meta.url, `${ROOT_FOLDER}/index.html`), "utf-8");
            res.send(html);
        }
        catch (err) {
            next(err);
        }
    });
}
else {
    app.use(Express.static(root));
}


app.listen(process.env.FILE_SERVER_PORT, () => console.log(`${argv[2]} server listening on port ${process.env.FILE_SERVER_PORT}`));