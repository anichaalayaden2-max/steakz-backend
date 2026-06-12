import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET DASHBOARD STATS - Returns overall statistics for the Admin
export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Count total branches - shows how many locations the restaurant has
    const totalBranches = await prisma.branch.count();

    // Count total users - shows how many staff members are registered
    const totalUsers = await prisma.user.count();

    // Count total customers - shows how many customers are in the system
    const totalCustomers = await prisma.customer.count();

    // Count total menu items - shows how many dishes are available across all branches
    const totalMenuItems = await prisma.menuItem.count();

    // Count total orders - shows how many orders have been placed
    const totalOrders = await prisma.order.count();

    // Count total tables - shows how many tables exist across all branches
    const totalTables = await prisma.table.count();

    // Count paid payments - shows how many orders have been successfully paid
    const paidPayments = await prisma.payment.count({
      where: { status: "PAID" },
    });

    // Count pending orders - shows how many orders are still waiting to be prepared
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });

    // Count today's reservations - shows how many reservations are scheduled for today
    const todayReservations = await prisma.reservation.count({
      where: {
        reservationDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    // Calculate total revenue from all paid payments - shows the total money earned
    const payments = await prisma.payment.findMany({
      where: { status: "PAID" },
    });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      totalBranches,
      totalUsers,
      totalCustomers,
      totalMenuItems,
      totalOrders,
      totalTables,
      totalRevenue,
      paidPayments,
      pendingOrders,
      todayReservations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET HQ STATS - Returns performance statistics for each branch (HQ Manager view)
export const getHQStats = async (req: Request, res: Response) => {
  try {
    // Fetch all branches with their orders and payments - needed to calculate revenue per branch
    const branches = await prisma.branch.findMany({
      include: {
        Order: {
          include: {
            Payment: true,
          },
        },
        Reservation: true,
      },
    });

    // Calculate revenue, orders and reservations for each branch - allows HQ to compare branch performance
    const branchStats = branches.map((branch) => {
      const revenue = branch.Order.reduce(
        (sum, order) =>
          sum + order.Payment.reduce((paymentSum, payment) => paymentSum + payment.amount, 0),
        0
      );

      return {
        id: branch.id,
        name: branch.name,
        location: branch.location,
        revenue,
        orders: branch.Order.length,
        reservations: branch.Reservation.length,
      };
    });

    res.status(200).json(branchStats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET BRANCH STATS - Returns statistics for a specific branch (Branch Manager view)
export const getBranchStats = async (req: Request, res: Response) => {
  try {
    // Get the branchId from the logged in user's token - ensures staff only see their own branch data
    const user = req.user as any;
    const branchId = user.branchId;

    // Count orders for this branch - shows how busy the branch is
    const totalOrders = await prisma.order.count({
      where: { branchId },
    });

    // Count tables for this branch - shows the seating capacity
    const totalTables = await prisma.table.count({
      where: { branchId },
    });

    // Count reservations for this branch - shows how many bookings have been made
    const reservations = await prisma.reservation.count({
      where: { branchId },
    });

    // Count paid payments for this branch - shows how many orders have been completed
    const paidPayments = await prisma.payment.count({
      where: { status: "PAID", Order: { branchId } },
    });

    // Count pending orders for this branch - shows how many orders are still being processed
    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING", branchId },
    });

    // Count today's reservations for this branch - helps staff prepare for the day
    const todayReservations = await prisma.reservation.count({
      where: {
        branchId,
        reservationDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    // Calculate total revenue for this branch from paid payments - shows how much money the branch has earned
    const payments = await prisma.payment.findMany({
      where: { status: "PAID", Order: { branchId } },
    });
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

    res.status(200).json({
      totalOrders,
      totalTables,
      reservations,
      totalRevenue,
      paidPayments,
      pendingOrders,
      todayReservations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};