import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";

import chatRouter from "./routes/chat.route.js";
import searchRouter from "./routes/search.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(morgan("dev"));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Global Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : "Internal Server Error";

  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
  });
});

//Routes
app.use("/", chatRouter);
app.use("/search", searchRouter);

app.listen(PORT, () => {
  console.log("Listening on port: ", PORT);
});
