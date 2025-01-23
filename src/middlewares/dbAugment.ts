import prisma from "../db";

export const dbAugment = (req, _, next) => {
  req.db = prisma;
  next();
};
