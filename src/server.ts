import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/corsOptions";
import { credentials } from "./middlewares/credentials.middleware";
//import { protect } from "./modules/authentication.module";
import { dbAugment } from "./middlewares/dbAugment";

const PORT = process.env.PORT || 3000;

import authRouter from "./routes/auth.route";
//import refreshRouter from "./routes/refresh.route";
// import chatRouter from "./routes/chat.route";
// import searchRouter from "./routes/search.route";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(credentials)
    .use(cors(corsOptions))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(dbAugment)
    .use(cookieParser())
    .use((err, req, res, next) => {
      console.error(err.message);

      const statusCode = err.statusCode || 500;
      const message = err.isOperational ? err.message : "Internal Server Error";

      res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
      });
    })

    .get("/", (_, res) => {
      return res.status(401).json({ message: "This is a private API." });
    })
    .use("/auth", authRouter);
  // .use("/refresh", refreshRouter)

  return app;
};

//Routes
// app.use("/", chatRouter);
// app.use("/search", searchRouter);
