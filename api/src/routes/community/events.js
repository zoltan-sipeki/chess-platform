import Express from "express";

const router = Express.Router();

router.get("/", (req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache"
    });

    const { sse } = req.app.locals;
    const userId = req.session.userID;
    sse.set(userId, res);
    req.once("close", e => {
        sse.delete(userId);
    });
});

export { router as default };