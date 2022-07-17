import "./dotenv.js";
import Express from "express";
import Routes from "./routes/index.js";

const app = Express();

app.locals.sse = new Map();
app.use((req, res, next) => {
    req.url = req.url.replace(/^\/api/, "/");
    next();
});
app.use("/", Routes);
app.get("/hch", (req, res) => {
    res.sendStatus(200);
})

app.listen(process.env.API_PORT, () => {
    console.log(`Server listening on port ${process.env.API_PORT}.`);
});




