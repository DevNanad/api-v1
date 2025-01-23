import { PrismaClient } from "@prisma/client";
import { ValidationError } from "../modules/errors.module";

const prisma = new PrismaClient();

// Update Subscription
export const updateSubscription = async (req, res, next) => {
  try {
    const { userId } = req.params; // User ID passed as a parameter
    const { subscription, subscription_end } = req.body;

    // Validate request
    if (!subscription || !subscription_end) {
      return next(
        new ValidationError("Subscription type and end date are required")
      );
    }

    // Ensure valid subscription type
    const validSubscriptions = ["FREE", "BASIC", "ENTERPRISE"];
    if (!validSubscriptions.includes(subscription.toUpperCase())) {
      return res.status(400).json({ message: "Invalid subscription type" });
    }

    // Update user's subscription
    const updatedUser = await req.db.subscription.update({
      where: { id: userId },
      data: {
        subscription: subscription.toUpperCase(),
        subscription_end: new Date(subscription_end),
      },
    });

    res.status(200).json({
      message: "Subscription updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// Get Subscription Details
export const getSubscription = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Find the user
    const user = await req.db.user.findUnique({
      where: { id: userId },
      select: {
        subscription: true,
        subscription_start: true,
        subscription_end: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      subscription: user.subscription,
      subscription_start: user.subscription_start,
      subscription_end: user.subscription_end,
    });
  } catch (error) {
    next(error);
  }
};
