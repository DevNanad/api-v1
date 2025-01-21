import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/corsOptions";
import { credentials } from "./middlewares/credentials.middleware";
import { protect } from "./modules/authentication.module";

const PORT = process.env.PORT || 3000;

// import userRouter from "./routes/userRoute";
// import refreshRouter from "./routes/refreshTokenRoute";
import chatRouter from "./routes/chat.route";
import searchRouter from "./routes/search.route";

export const createServer = () => {
  const app = express();
  app
    .disable("x-powered-by")
    .use(morgan("dev"))
    .use(credentials)
    .use(cors(corsOptions))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cookieParser())
    .use((err, req, res, next) => {
      console.error(err.stack);

      const statusCode = err.statusCode || 500;
      const message = err.isOperational ? err.message : "Internal Server Error";

      res.status(statusCode).json({
        status: "error",
        statusCode,
        message,
      });
    })

    .get("/", protect, (_, res) => {
      return res.status(401).json({ message: "This is a private API." });
    });
  // .use("/api/v1/user/", userRouter)
  // .use("/api/v1/refresh/", refreshRouter);

  return app;
};

//Routes
// app.use("/", chatRouter);
// app.use("/search", searchRouter);
