import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getTables = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    const tables = await prisma.table.findMany({
      where: branchId ? { branchId: Number(branchId) } : {},
      include: {
        Branch: true,
      },
    });

    res.status(200).json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getTableById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const table = await prisma.table.findUnique({
      where: { id },
      include: { Branch: true },
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.status(200).json(table);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createTable = async (req: Request, res: Response) => {
  try {
    const { tableNumber, capacity, branchId } = req.body;

    const table = await prisma.table.create({
      data: {
        tableNumber: String(tableNumber),
        capacity: Number(capacity),
        branchId: Number(branchId),
      },
    });

    res.status(201).json(table);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to create table" });
  }
};

export const updateTable = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { tableNumber, capacity, branchId } = req.body;

    const table = await prisma.table.update({
      where: { id },
      data: {
        tableNumber: String(tableNumber),
        capacity: Number(capacity),
        branchId: Number(branchId),
      },
    });

    res.status(200).json(table);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update table" });
  }
};

export const deleteTable = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Apagar reservations ligadas à table
    await prisma.reservation.updateMany({
      where: { tableId: id },
      data: { tableId: null },
    });

    // Apagar orders ligados à table primeiro
    const orders = await prisma.order.findMany({
      where: { tableId: id },
    });

    for (const order of orders) {
      // Apagar receipts → payments → orderItems → order
      const payments = await prisma.payment.findMany({
        where: { orderId: order.id },
      });

      for (const payment of payments) {
        await prisma.receipt.deleteMany({ where: { paymentId: payment.id } });
      }

      await prisma.payment.deleteMany({ where: { orderId: order.id } });
      await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
      await prisma.order.delete({ where: { id: order.id } });
    }

    await prisma.table.delete({ where: { id } });

    res.status(200).json({ message: "Table deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete table" });
  }
};