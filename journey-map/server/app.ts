import express from "express";

const port = process.env.PORT || 3000;

const app = express();

app.use(express.static("public"));

app.get("/healthcheck", (req, res) => {
  res.status(200).send("OK");
});

app.listen(port, () => {
  console.log(`Diagram available at http://localhost:${port}`);
});
