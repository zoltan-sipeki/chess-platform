import Express from "express";
import * as UserCache from "../../utils/user-cache.js";
import { readFile } from "../../utils/file.mjs";

const REPLAY_PATH = "/replays";

const router = Express.Router();

router.get("/:id/replay", async (req, res, next) => {
    try {
        let replay = await readFile(`${REPLAY_PATH}/${req.params.id}.json`);
        replay = JSON.parse(replay);

        const { players } = replay;
        const playerData = await Promise.all(players.map(player => UserCache.get(player.id, "id", "name", "tag", "avatar")));

        players.forEach((player, index) => {
            if (playerData[index] != null) {
                Object.assign(player, playerData[index]);
            }
            else {
                player.id = null;
            }
        });

        res.json(replay);
    }
    catch (err) {
        if (err.code === 404) {
            res.sendStatus(404);
        }
        else {
            next(next);
        }
    }
});

export { router as default };