import { PrismaClient } from "@prisma/client";

// Connect to the database - this allows the app to read and write data
const prisma = new PrismaClient();

export default prisma;