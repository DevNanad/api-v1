import { Router } from "express";
const router = Router();

import { sendResponse } from "../controller/chat.controller.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/", asyncHandler(sendResponse));

export default router;
