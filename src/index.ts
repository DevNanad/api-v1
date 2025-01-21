import * as dotenv from "dotenv";
import { createServer } from "./server.js";
import config from "./config/index.js";

dotenv.config();

const server = createServer();
server.listen(config.port, () => {
  console.log(`Api running on ${config.port}`);
});
