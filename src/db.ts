import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;

const pool: any = new Pool({ connectionString });
const adapter: any = new PrismaPg(pool);
const prisma: any = new PrismaClient({ adapter });

// Test the database connection on startup
prisma
  .$connect()
  .then(() => {
    console.log("Connected to the database.");
  })
  .catch((err) => {
    console.error("Error connecting to the database:", err);
  });

// Handle graceful shutdown
prisma.$on("", async () => {
  await prisma.$disconnect();
  console.log("Disconnected from the database.");
});

export default prisma;
