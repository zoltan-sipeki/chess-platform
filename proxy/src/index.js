import "./dotenv.js";
import Express from "express";
import HttpProxy from "http-proxy";
import HTTP from "http";
import HTTPS from "https";
import FS from "fs";
import Helmet from "helmet";

const app = Express();
const proxy = HttpProxy.createProxyServer();

proxy.on("error", err => {
    console.error(err);
});

app.use(Helmet({
    contentSecurityPolicy: {
        directives: {
            imgSrc: ["'self'", "data:", "blob:"]
        }
    }
}));

app.use("/api", (req, res) => {
    proxy.web(req, res, { 
        target: {
            host: process.env.API_HOST, 
            port: process.env.API_PORT
        }
    });
});

app.use("/chat", (req, res) => {
    proxy.web(req, res, {
        target: {
            host: process.env.CHAT_HOST,
            port: process.env.CHAT_PORT
        }
    });
});

app.use("/chess", (req, res) => {
    proxy.web(req, res, {
        target: {
            host: process.env.CHESS_HOST,
            port: process.env.CHESS_PORT
        }
    });
});

app.get("/hch", (req, res) => {
    res.sendStatus(200);
});

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

const http = HTTP.createServer(app);

http.on("upgrade", (req, socket, head) => {
    setupWSConnections(req, socket, head);
});

const https = HTTPS.createServer({
    cert: FS.readFileSync(process.env.TLS_CERT_PATH),
    key: FS.readFileSync(process.env.TLS_KEY_PATH)
}, app);

https.on("upgrade", (req, socket, head) => {
    setupWSConnections(req, socket, head);
});

http.listen(process.env.PROXY_PORT, () => console.log(`Proxy server listening on port ${process.env.PROXY_PORT}`));
https.listen(process.env.PROXY_HTTPS_PORT, () => console.log(`Proxy server listening on port ${process.env.PROXY_HTTPS_PORT}`));

function setupWSConnections(req, socket, head) {
    if (req.url.startsWith("/chat")) {
        proxy.ws(req, socket, head, {
            target: {
                host: process.env.CHAT_HOST,
                port: process.env.CHAT_PORT
            }
        });
    }
    else if (req.url.startsWith("/chess")) {
        proxy.ws(req, socket, head, {
            target: {
                host: process.env.CHESS_HOST,
                port: process.env.CHESS_PORT
            }
        });
    }
}