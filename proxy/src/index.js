import "./dotenv.js";
import Express from "express";
import HttpProxy from "http-proxy";
import FS from "fs/promises";
import { mypath } from "../../common/utils.mjs";

const PUBLIC_FOLDER = mypath(import.meta.url, "../../public");

const app = Express();
const proxy = HttpProxy.createProxyServer();

app.use("/api", proxyRequest("/api", { host: process.env.API_HOST, port: process.env.API_PORT }));
app.use("/chat", proxyRequest("/chat", { host: process.env.CHAT_HOST, port: process.env.CHAT_PORT }));
app.use("/chess", proxyRequest("/chess", { host: process.env.CHESS_HOST, port: process.env.CHESS_PORT }));

app.use(Express.static(PUBLIC_FOLDER), async (req, res) => {
    try {
        const indexPage = await FS.readFile(`${PUBLIC_FOLDER}/index.html`, "utf-8");        
        res.send(indexPage);
    }
    catch (err) {
        next(err);
    }
});

const server = app.listen(process.env.PROXY_PORT, () => console.log(`Proxy server listening on port ${process.env.PROXY_PORT}`));

server.on("upgrade", (req, socket, head) => {
    if (req.url.startsWith("/chat")) {
        req.url = req.url.replace("/chat", "/");
        proxy.ws(req, socket, head, { 
            target: { 
                host: process.env.CHAT_HOST, 
                port: process.env.CHAT_PORT 
            } 
        });
    }
    else if (req.url.startsWith("/chess")) {
        req.url = req.url.replace("/chess", "/");
        proxy.ws(req, socket, head, { 
            target: { 
                host: process.env.CHESS_HOST, 
                port: process.env.CHESS_PORT 
            } 
        });
    }
    else {
        res.statusCode = 404;
        res.end();
    }
});


function proxyRequest(prefix, target) {
    return (req, res, next) => {
        if (req.url.startsWith(prefix)) {
            req.url = req.url.replace(prefix, "/");
        }
        proxy.web(req, res, { target });
    }
}
