import { Router } from "express";
const router = Router();

import { searchVector } from "../controller/search.controller.js";

const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.post("/", asyncHandler(searchVector));

export default router;
