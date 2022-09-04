import "./dotenv.js";
import Express from "express";
import ExpressWS from "express-ws";
import { redisSession } from "./redis-session.js";
import { initServer, onConnect, getRoom } from "./game-server.js";

initServer();

const app = Express();
const appWS = ExpressWS(app);

app.disable("x-powered-by");
app.set("trust proxy", true);

app.use((req, res, next) => {
    req.url = req.url.replace(/^\/chess$|^\/chess\//, "/");
    next();
});
app.use(Express.json());
app.use(redisSession);
app.ws("/", (socket, req) => {
    if (!req.session.userID) {
        socket.close(1002, "Unauthorized");
        return;
    }
    onConnect(req.session.userID, socket);
});


app.get("/matches/:id", async (req, res) => {
    if (!req.session.userID) {
        res.sendStatus(401);
        return;
    }

    const room = getRoom(req.params.id);
    if (!room) {
        res.sendStatus(404);
        return;
    }

    const player = room.getPlayer(req.session.userID);
    if (!player) {
        res.sendStatus(403);
        return;
    }


    if (room.gameStarted) {
        res.json(await room.getGameState(player.id));
    }
    else {
        res.sendStatus(204);
    }

});

app.get("/hch", (req, res) => {
    res.sendStatus(200);
})

app.listen(process.env.CHESS_PORT, () => console.log(`Game server listening on port ${process.env.CHESS_PORT}.`));
