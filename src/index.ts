import * as dotenv from "dotenv";
import { createServer } from "./server";
import config from "./config";

dotenv.config();

const server = createServer();
server.listen(config.port, () => {
  console.log(`Api running on ${config.port}`);
});
