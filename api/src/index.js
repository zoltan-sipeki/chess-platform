import "./dotenv.js";
import Express from "express";
import Routes from "./routes/index.js";

const app = Express();

app.disable("x-powered-by");
app.set("trust proxy", true);

app.locals.sse = new Map();

app.use("/", Routes);

app.listen(process.env.API_PORT, () => {
    console.log(`Server listening on port ${process.env.API_PORT}.`);
});




