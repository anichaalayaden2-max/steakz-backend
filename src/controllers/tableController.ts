import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET ALL TABLES - Returns tables filtered by branch
export const getTables = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    // Filter tables by branchId if provided - ensures each branch only sees its own tables
    const tables = await prisma.table.findMany({
      where: branchId ? { branchId: Number(branchId) } : {},
      include: {
        Branch: true, // Include branch details
      },
    });

    res.status(200).json(tables);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET TABLE BY ID - Returns a single table by its ID
export const getTableById = async (req: Request, res: Response) => {
  try {
    // Get the table ID from the URL - identifies which table to retrieve
    const id = Number(req.params.id);

    const table = await prisma.table.findUnique({
      where: { id },
      include: { Branch: true },
    });

    // Return 404 if table does not exist - prevents returning empty data
    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    res.status(200).json(table);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE TABLE - Adds a new table to a branch
export const createTable = async (req: Request, res: Response) => {
  try {
    const { tableNumber, capacity, branchId } = req.body;

    // Save the new table linked to a specific branch - allows each branch to manage its own seating
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

// UPDATE TABLE - Updates an existing table's details
export const updateTable = async (req: Request, res: Response) => {
  try {
    // Get the table ID from the URL - identifies which table to update
    const id = Number(req.params.id);
    const { tableNumber, capacity, branchId } = req.body;

    // Update the table details in the database - keeps table information accurate
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

// DELETE TABLE - Removes a table and all its related data
export const deleteTable = async (req: Request, res: Response) => {
  try {
    // Get the table ID from the URL - identifies which table to delete
    const id = Number(req.params.id);

    // Remove the table reference from reservations - prevents database errors from foreign key constraints
    await prisma.reservation.updateMany({
      where: { tableId: id },
      data: { tableId: null },
    });

    // Find all orders linked to this table - needed before deleting
    const orders = await prisma.order.findMany({
      where: { tableId: id },
    });

    // Delete receipts, payments and order items for each order - must follow this order to avoid database errors
    for (const order of orders) {
      const payments = await prisma.payment.findMany({
        where: { orderId: order.id },
      });

      // Delete receipts first, then payments, then order items, then the order
      for (const payment of payments) {
        await prisma.receipt.deleteMany({ where: { paymentId: payment.id } });
      }

      await prisma.payment.deleteMany({ where: { orderId: order.id } });
      await prisma.orderItem.deleteMany({ where: { orderId: order.id } });
      await prisma.order.delete({ where: { id: order.id } });
    }

    // Finally delete the table - removes tables that are no longer in use
    await prisma.table.delete({ where: { id } });

    res.status(200).json({ message: "Table deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete table" });
  }
};