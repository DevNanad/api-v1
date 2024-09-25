import { Router } from "express";
const router = Router();

import { getResponse } from "../controller/chat.controller.js";

router.get("/", getResponse);

export default router;
