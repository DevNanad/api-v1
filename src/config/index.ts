import merge from "lodash.merge";
import prod from "./prod";
import local from "./local";
// make sure NODE_ENV is set
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const stage = process.env.STAGE || "local";
let envConfig;

// dynamically require each config depending on the stage we're in
if (stage === "production") {
  envConfig = prod;
} else {
  envConfig = local;
}

const defaultConfig = {
  stage,
  dbUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  accessTokenSecret: process.env.ACCESSTOKEN_SECRET,
  refreshTokenSecret: process.env.REFRESHTOKEN_SECRET,
  port: process.env.PORT,
  logging: false,
};

export default merge(defaultConfig, envConfig);
