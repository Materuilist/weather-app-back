import express from "express";
import * as path from "path";

import initDb from "./utils/initDb.js";
import sequalize from "./utils/database.js";

import authRouter from "./routes/auth.router.js";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");

  next();
});

app.use("/", express.urlencoded());
app.use("/", express.json({ limit: "5mb" }));
app.use(express.static(path.join(path.resolve(), "static")));

app.use("/api/auth", authRouter);

app.use("/", (error, req, res, next) => {
  if (error) {
    console.log(error);
    return res.status(error.status).json({ message: error.message });
  }
});

sequalize.sync().then(() => {
  app.listen(8000, () => {
    console.log(`I'm listening!`);
    // initDb(true, true);
  });
});
