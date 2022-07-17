import "./dotenv.js";
import Express from "express";
import ExpressWS from "express-ws";
import { redisSession } from "./redis-session.js";
import { initServer, onConnect } from "./chat-server.js";

initServer();

const app = Express();
const appWS = ExpressWS(app);

app.use(Express.json());
app.use(redisSession);

app.ws("/", (socket, req) => {
    if (!req.session.userID) {
        socket.close(1002, "Unauthorized");
        return;
    }
    onConnect(socket, req.session.userID);
});

app.listen(process.env.CHAT_PORT, () => console.log(`Chat server listening on port ${process.env.CHAT_PORT}.`));