import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET ALL PAYMENTS - Returns payments filtered by branch
export const getPayments = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    // Filter payments by branchId through the Order - ensures each branch only sees its own payments
    const payments = await prisma.payment.findMany({
      where: branchId ? { Order: { branchId: Number(branchId) } } : {},
      include: {
        Order: {
          include: {
            Customer: true,   // Include customer details
            Table: true,      // Include table details
            OrderItem: {
              include: {
                MenuItem: true, // Include menu item details for each order item
              },
            },
          },
        },
      },
    });

    res.status(200).json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET PAYMENT BY ID - Returns a single payment by its ID
export const getPaymentById = async (req: Request, res: Response) => {
  try {
    // Get the payment ID from the URL - identifies which payment to retrieve
    const id = Number(req.params.id);

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        Order: {
          include: {
            Customer: true,
            Table: true,
            OrderItem: {
              include: {
                MenuItem: true,
              },
            },
          },
        },
      },
    });

    // Return 404 if payment does not exist - prevents returning empty data
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE PAYMENT - Processes a payment for a delivered order
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { amount, method, status, orderId } = req.body;

    // Save the payment linked to the order - records that the customer has paid
    const payment = await prisma.payment.create({
      data: {
        amount: Number(amount),
        method,   // CARD or CASH
        status,   // PAID
        orderId: Number(orderId),
      },
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE PAYMENT - Updates an existing payment's details
export const updatePayment = async (req: Request, res: Response) => {
  try {
    // Get the payment ID from the URL - identifies which payment to update
    const id = Number(req.params.id);
    const { amount, method, status } = req.body;

    // Update the payment details in the database - allows corrections if needed
    const payment = await prisma.payment.update({
      where: { id },
      data: { amount, method, status },
    });

    res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE PAYMENT - Removes a payment from the system
export const deletePayment = async (req: Request, res: Response) => {
  try {
    // Get the payment ID from the URL - identifies which payment to delete
    const id = Number(req.params.id);

    // Delete the payment from the database - removes incorrect or test payments
    await prisma.payment.delete({ where: { id } });

    res.status(200).json({ message: "Payment deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};