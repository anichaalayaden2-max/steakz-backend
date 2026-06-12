import prisma from "./prisma.js";
import bcrypt from "bcrypt";

// SEED FILE - Populates the database with initial data for testing and presentation
async function main() {
  console.log("Seeding database...");

  // Create the 3 restaurant branches - sets up the London, Manchester and Liverpool locations
  const london = await prisma.branch.upsert({
    where: { id: 1 },
    update: {},
    create: { name: "Steakz London", location: "London", phone: "999999999" },
  });

  const manchester = await prisma.branch.upsert({
    where: { id: 2 },
    update: {},
    create: { name: "Steakz Manchester", location: "Manchester", phone: "999999999" },
  });

  const liverpool = await prisma.branch.upsert({
    where: { id: 3 },
    update: {},
    create: { name: "Steakz Liverpool", location: "Liverpool", phone: "999999999" },
  });

  console.log("Branches created!");

  // Encrypt the default password - all test users share the same password "123456"
  const password = await bcrypt.hash("123456", 10);

  // Create Admin user - has access to all branches and all features
  await prisma.user.upsert({
    where: { email: "admin@steakz.com" },
    update: {},
    create: { name: "Admin", email: "admin@steakz.com", password, role: "ADMIN", branchId: london.id },
  });

  // Create HQ Manager - can view reports and performance across all branches
  await prisma.user.upsert({
    where: { email: "hq@steakz.com" },
    update: {},
    create: { name: "HQ Manager", email: "hq@steakz.com", password, role: "HQ_MANAGER", branchId: london.id },
  });

  // Create staff for London branch - one user per role
  await prisma.user.upsert({
    where: { email: "manager.london@steakz.com" },
    update: {},
    create: { name: "Branch Manager London", email: "manager.london@steakz.com", password, role: "BRANCH_MANAGER", branchId: london.id },
  });

  await prisma.user.upsert({
    where: { email: "waiter.london@steakz.com" },
    update: {},
    create: { name: "Waiter London", email: "waiter.london@steakz.com", password, role: "WAITER", branchId: london.id },
  });

  await prisma.user.upsert({
    where: { email: "chef.london@steakz.com" },
    update: {},
    create: { name: "Chef London", email: "chef.london@steakz.com", password, role: "CHEF", branchId: london.id },
  });

  await prisma.user.upsert({
    where: { email: "cashier.london@steakz.com" },
    update: {},
    create: { name: "Cashier London", email: "cashier.london@steakz.com", password, role: "CASHIER", branchId: london.id },
  });

  // Create staff for Manchester branch - one user per role
  await prisma.user.upsert({
    where: { email: "manager.manchester@steakz.com" },
    update: {},
    create: { name: "Branch Manager Manchester", email: "manager.manchester@steakz.com", password, role: "BRANCH_MANAGER", branchId: manchester.id },
  });

  await prisma.user.upsert({
    where: { email: "waiter.manchester@steakz.com" },
    update: {},
    create: { name: "Waiter Manchester", email: "waiter.manchester@steakz.com", password, role: "WAITER", branchId: manchester.id },
  });

  await prisma.user.upsert({
    where: { email: "chef.manchester@steakz.com" },
    update: {},
    create: { name: "Chef Manchester", email: "chef.manchester@steakz.com", password, role: "CHEF", branchId: manchester.id },
  });

  await prisma.user.upsert({
    where: { email: "cashier.manchester@steakz.com" },
    update: {},
    create: { name: "Cashier Manchester", email: "cashier.manchester@steakz.com", password, role: "CASHIER", branchId: manchester.id },
  });

  // Create staff for Liverpool branch - one user per role
  await prisma.user.upsert({
    where: { email: "manager.liverpool@steakz.com" },
    update: {},
    create: { name: "Branch Manager Liverpool", email: "manager.liverpool@steakz.com", password, role: "BRANCH_MANAGER", branchId: liverpool.id },
  });

  await prisma.user.upsert({
    where: { email: "waiter.liverpool@steakz.com" },
    update: {},
    create: { name: "Waiter Liverpool", email: "waiter.liverpool@steakz.com", password, role: "WAITER", branchId: liverpool.id },
  });

  await prisma.user.upsert({
    where: { email: "chef.liverpool@steakz.com" },
    update: {},
    create: { name: "Chef Liverpool", email: "chef.liverpool@steakz.com", password, role: "CHEF", branchId: liverpool.id },
  });

  await prisma.user.upsert({
    where: { email: "cashier.liverpool@steakz.com" },
    update: {},
    create: { name: "Cashier Liverpool", email: "cashier.liverpool@steakz.com", password, role: "CASHIER", branchId: liverpool.id },
  });

  // Create 5 tables for each branch with different capacities - supports different group sizes
  await prisma.table.createMany({
    data: [
      { tableNumber: "T1", capacity: 1, branchId: london.id, status: "AVAILABLE" },
      { tableNumber: "T2", capacity: 2, branchId: london.id, status: "AVAILABLE" },
      { tableNumber: "T3", capacity: 3, branchId: london.id, status: "AVAILABLE" },
      { tableNumber: "T4", capacity: 6, branchId: london.id, status: "AVAILABLE" },
      { tableNumber: "T5", capacity: 10, branchId: london.id, status: "AVAILABLE" },
    ],
    skipDuplicates: true, // Skip if tables already exist - prevents duplicate data
  });

  await prisma.table.createMany({
    data: [
      { tableNumber: "T1", capacity: 1, branchId: manchester.id, status: "AVAILABLE" },
      { tableNumber: "T2", capacity: 2, branchId: manchester.id, status: "AVAILABLE" },
      { tableNumber: "T3", capacity: 3, branchId: manchester.id, status: "AVAILABLE" },
      { tableNumber: "T4", capacity: 6, branchId: manchester.id, status: "AVAILABLE" },
      { tableNumber: "T5", capacity: 10, branchId: manchester.id, status: "AVAILABLE" },
    ],
    skipDuplicates: true,
  });

  await prisma.table.createMany({
    data: [
      { tableNumber: "T1", capacity: 1, branchId: liverpool.id, status: "AVAILABLE" },
      { tableNumber: "T2", capacity: 2, branchId: liverpool.id, status: "AVAILABLE" },
      { tableNumber: "T3", capacity: 3, branchId: liverpool.id, status: "AVAILABLE" },
      { tableNumber: "T4", capacity: 6, branchId: liverpool.id, status: "AVAILABLE" },
      { tableNumber: "T5", capacity: 10, branchId: liverpool.id, status: "AVAILABLE" },
    ],
    skipDuplicates: true,
  });

  // Create menu items for London - each branch has its own menu
  await prisma.menuItem.createMany({
    data: [
      { name: "Ribeye Steak", description: "Prime cut, rich marbling, grilled to perfection", price: 28.90, image: "", category: "STEAK", branchId: london.id },
      { name: "Sirloin Steak", description: "Tender and flavourful, aged 28 days", price: 24.00, image: "", category: "STEAK", branchId: london.id },
      { name: "Fillet Steak", description: "The most tender cut, melt-in-mouth", price: 34.90, image: "", category: "STEAK", branchId: london.id },
      { name: "T-Bone Steak", description: "Best of both worlds, sirloin and fillet", price: 36.90, image: "", category: "STEAK", branchId: london.id },
      { name: "Classic Burger", description: "Beef patty, lettuce, tomato, cheese", price: 14.00, image: "", category: "BURGER", branchId: london.id },
      { name: "BBQ Burger", description: "Smoky BBQ sauce, crispy bacon, cheddar", price: 16.00, image: "", category: "BURGER", branchId: london.id },
      { name: "Fries", description: "Crispy golden fries with sea salt", price: 4.50, image: "", category: "SIDE", branchId: london.id },
      { name: "Onion Rings", description: "Beer-battered onion rings", price: 5.00, image: "", category: "SIDE", branchId: london.id },
      { name: "Coke", description: "Ice cold Coca-Cola", price: 3.00, image: "", category: "DRINK", branchId: london.id },
      { name: "Beer", description: "Draft beer, cold and refreshing", price: 5.50, image: "", category: "DRINK", branchId: london.id },
      { name: "Cheesecake", description: "New York style with berry compote", price: 7.50, image: "", category: "DESSERT", branchId: london.id },
      { name: "Chocolate Lava", description: "Warm chocolate fondant with ice cream", price: 8.00, image: "", category: "DESSERT", branchId: london.id },
    ],
    skipDuplicates: true,
  });

  // Create menu items for Manchester
  await prisma.menuItem.createMany({
    data: [
      { name: "Ribeye Steak", description: "Prime cut, rich marbling, grilled to perfection", price: 28.90, image: "", category: "STEAK", branchId: manchester.id },
      { name: "Sirloin Steak", description: "Tender and flavourful, aged 28 days", price: 24.00, image: "", category: "STEAK", branchId: manchester.id },
      { name: "Fillet Steak", description: "The most tender cut, melt-in-mouth", price: 34.90, image: "", category: "STEAK", branchId: manchester.id },
      { name: "T-Bone Steak", description: "Best of both worlds, sirloin and fillet", price: 36.90, image: "", category: "STEAK", branchId: manchester.id },
      { name: "Classic Burger", description: "Beef patty, lettuce, tomato, cheese", price: 14.00, image: "", category: "BURGER", branchId: manchester.id },
      { name: "BBQ Burger", description: "Smoky BBQ sauce, crispy bacon, cheddar", price: 16.00, image: "", category: "BURGER", branchId: manchester.id },
      { name: "Fries", description: "Crispy golden fries with sea salt", price: 4.50, image: "", category: "SIDE", branchId: manchester.id },
      { name: "Coke", description: "Ice cold Coca-Cola", price: 3.00, image: "", category: "DRINK", branchId: manchester.id },
      { name: "Beer", description: "Draft beer, cold and refreshing", price: 5.50, image: "", category: "DRINK", branchId: manchester.id },
      { name: "Cheesecake", description: "New York style with berry compote", price: 7.50, image: "", category: "DESSERT", branchId: manchester.id },
    ],
    skipDuplicates: true,
  });

  // Create menu items for Liverpool
  await prisma.menuItem.createMany({
    data: [
      { name: "Ribeye Steak", description: "Prime cut, rich marbling, grilled to perfection", price: 28.90, image: "", category: "STEAK", branchId: liverpool.id },
      { name: "Sirloin Steak", description: "Tender and flavourful, aged 28 days", price: 24.00, image: "", category: "STEAK", branchId: liverpool.id },
      { name: "Fillet Steak", description: "The most tender cut, melt-in-mouth", price: 34.90, image: "", category: "STEAK", branchId: liverpool.id },
      { name: "Classic Burger", description: "Beef patty, lettuce, tomato, cheese", price: 14.00, image: "", category: "BURGER", branchId: liverpool.id },
      { name: "BBQ Burger", description: "Smoky BBQ sauce, crispy bacon, cheddar", price: 16.00, image: "", category: "BURGER", branchId: liverpool.id },
      { name: "Fries", description: "Crispy golden fries with sea salt", price: 4.50, image: "", category: "SIDE", branchId: liverpool.id },
      { name: "Coke", description: "Ice cold Coca-Cola", price: 3.00, image: "", category: "DRINK", branchId: liverpool.id },
      { name: "Beer", description: "Draft beer, cold and refreshing", price: 5.50, image: "", category: "DRINK", branchId: liverpool.id },
      { name: "Cheesecake", description: "New York style with berry compote", price: 7.50, image: "", category: "DESSERT", branchId: liverpool.id },
      { name: "Chocolate Lava", description: "Warm chocolate fondant with ice cream", price: 8.00, image: "", category: "DESSERT", branchId: liverpool.id },
    ],
    skipDuplicates: true,
  });

  console.log("✅ Seed completed!");
}

// Run the seed function and disconnect from the database when done
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });