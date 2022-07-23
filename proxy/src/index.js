import "./dotenv.js";
import Express from "express";
import HttpProxy from "http-proxy";

const app = Express();
const proxy = HttpProxy.createProxyServer();

app.use("/api", proxyRequest("/api", { host: process.env.API_HOST, port: process.env.API_PORT }));
app.use("/chat", proxyRequest("/chat", { host: process.env.CHAT_HOST, port: process.env.CHAT_PORT }));
app.use("/chess", proxyRequest("/chess", { host: process.env.CHESS_HOST, port: process.env.CHESS_PORT }));

app.use((req, res) => {
    if (req.method === "GET") {
        proxy.web(req, res, {
            target: {
                host: process.env.FRONT_END_HOST,
                port: process.env.FRONT_END_PORT
            }
        });
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
