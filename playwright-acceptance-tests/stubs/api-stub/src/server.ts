import express from "express";
import { registerStaticRoutes } from "./routes/static.js";

const app = express();
app.use(express.json());

registerStaticRoutes(app);

app.delete("/test/state", (_req, res) => res.sendStatus(204));
app.delete("/test/state/session", (_req, res) => res.sendStatus(204));

app.listen(8080, () => console.log("API stub listening on port 8080"));
