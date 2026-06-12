import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET ALL RECEIPTS - Returns receipts filtered by branch
export const getReceipts = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    // Fetch all receipts with full order details - needed to display complete receipt information
    const receipts = await prisma.receipt.findMany({
      include: {
        Payment: {
          include: {
            Order: {
              include: {
                Customer: true,   // Include customer details
                Table: true,      // Include table details
                Branch: true,     // Include branch details
                OrderItem: {
                  include: {
                    MenuItem: true, // Include menu item details for each order item
                  },
                },
              },
            },
          },
        },
      },
    });

    // Filter receipts by branchId after fetching - ensures each branch only sees its own receipts
    const filtered = branchId
      ? receipts.filter((r) => r.Payment?.Order?.branchId === Number(branchId))
      : receipts;

    res.status(200).json(filtered);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET RECEIPT BY ID - Returns a single receipt by its ID
export const getReceiptById = async (req: Request, res: Response) => {
  try {
    // Get the receipt ID from the URL - identifies which receipt to retrieve
    const id = Number(req.params.id);

    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        Payment: {
          include: {
            Order: {
              include: {
                Customer: true,
                Table: true,
                Branch: true,
                OrderItem: {
                  include: {
                    MenuItem: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Return 404 if receipt does not exist - prevents returning empty data
    if (!receipt) {
      return res.status(404).json({ message: "Receipt not found" });
    }

    res.status(200).json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE RECEIPT - Generates a new receipt for a paid order
export const createReceipt = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;

    // Count existing receipts to generate the next receipt number - ensures each receipt has a unique number like REC-0001
    const count = await prisma.receipt.count();
    const receiptNumber = `REC-${String(count + 1).padStart(4, "0")}`;

    // Create the receipt linked to the payment with all order details - provides a complete record of the transaction
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        paymentId: Number(paymentId),
      },
      include: {
        Payment: {
          include: {
            Order: {
              include: {
                Customer: true,
                Table: true,
                Branch: true,
                OrderItem: {
                  include: {
                    MenuItem: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(201).json(receipt);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE RECEIPT - Removes a receipt from the system
export const deleteReceipt = async (req: Request, res: Response) => {
  try {
    // Get the receipt ID from the URL - identifies which receipt to delete
    const id = Number(req.params.id);

    // Delete the receipt from the database - removes incorrect or test receipts
    await prisma.receipt.delete({ where: { id } });

    res.status(200).json({ message: "Receipt deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};