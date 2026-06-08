import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalBranches = await prisma.branch.count();
    const totalUsers = await prisma.user.count();
    const totalCustomers = await prisma.customer.count();
    const totalMenuItems = await prisma.menuItem.count();
    const totalOrders = await prisma.order.count();
    const totalTables = await prisma.table.count();

    const paidPayments = await prisma.payment.count({
      where: { status: "PAID" },
    });

    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });

    const todayReservations = await prisma.reservation.count({
      where: {
        reservationDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

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

export const getHQStats = async (req: Request, res: Response) => {
  try {
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

export const getBranchStats = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const branchId = user.branchId;

    const totalOrders = await prisma.order.count({
      where: { branchId },
    });

    const totalTables = await prisma.table.count({
      where: { branchId },
    });

    const reservations = await prisma.reservation.count({
      where: { branchId },
    });

    const paidPayments = await prisma.payment.count({
      where: {
        status: "PAID",
        Order: { branchId },
      },
    });

    const pendingOrders = await prisma.order.count({
      where: {
        status: "PENDING",
        branchId,
      },
    });

    const todayReservations = await prisma.reservation.count({
      where: {
        branchId,
        reservationDate: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const payments = await prisma.payment.findMany({
      where: {
        status: "PAID",
        Order: { branchId },
      },
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