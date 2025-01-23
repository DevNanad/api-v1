import express from "express";
import {
  updateSubscription,
  getSubscription,
} from "../controller/subscription.controller";

const router = express.Router();

router.get("/:userId", getSubscription); // Get subscription details
router.put("/:userId", updateSubscription); // Update subscription

export default router;
