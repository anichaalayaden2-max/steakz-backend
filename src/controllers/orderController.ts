import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET ALL ORDERS - Returns orders filtered by branch
export const getOrders = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    // Filter orders by branchId if provided - ensures each branch only sees its own orders
    const orders = await prisma.order.findMany({
      where: branchId ? { branchId: Number(branchId) } : {},
      include: {
        Customer: true,  // Include customer details
        Branch: true,    // Include branch details
        User: true,      // Include waiter details
        Table: true,     // Include table details
        OrderItem: {
          include: {
            MenuItem: true, // Include menu item details for each order item
          },
        },
      },
    });

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET ORDER BY ID - Returns a single order by its ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    // Get the order ID from the URL - identifies which order to retrieve
    const id = Number(req.params.id);

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        Customer: true,
        Branch: true,
        User: true,
        Table: true,
        OrderItem: {
          include: {
            MenuItem: true,
          },
        },
      },
    });

    // Return 404 if order does not exist - prevents returning empty data
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE ORDER - Creates a new order with menu items
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { status, totalAmount, customerId, branchId, tableId, waiterId, items } = req.body;

    // Get the waiter ID from the JWT token - automatically assigns the logged in waiter to the order
    const decoded = (req as any).user;
    const resolvedWaiterId = decoded?.id
      ? Number(decoded.id)
      : Number(waiterId);

    // Create the order and link it to the customer, branch, waiter and table
    const order = await prisma.order.create({
      data: {
        status,
        totalAmount: Number(totalAmount),
        Customer: { connect: { id: Number(customerId) } },
        Branch: { connect: { id: Number(branchId) } },
        User: { connect: { id: resolvedWaiterId } },
        Table: { connect: { id: Number(tableId) } },
        // Create all order items at the same time - saves each dish selected by the customer
        OrderItem: {
          create: items.map((item: any) => ({
            menuItemId: Number(item.menuItemId),
            quantity: Number(item.quantity),
            price: Number(item.price),
          })),
        },
      },
      include: {
        OrderItem: { include: { MenuItem: true } },
        Customer: true,
        Table: true,
      },
    });

    res.status(201).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE ORDER - Updates the status of an existing order
export const updateOrder = async (req: Request, res: Response) => {
  try {
    // Get the order ID from the URL - identifies which order to update
    const id = Number(req.params.id);
    const { status, totalAmount } = req.body;

    // Update the order status - allows chef to mark as PREPARING, READY and waiter to mark as DELIVERED
    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        totalAmount: totalAmount !== undefined ? Number(totalAmount) : undefined,
      },
    });

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE ORDER - Removes an order and all its related data
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    // Get the order ID from the URL - identifies which order to delete
    const id = Number(req.params.id);

    // Find all payments linked to this order - needed before deleting
    const payments = await prisma.payment.findMany({ where: { orderId: id } });

    // Delete all receipts linked to each payment first - prevents database errors from foreign key constraints
    for (const payment of payments) {
      await prisma.receipt.deleteMany({ where: { paymentId: payment.id } });
    }

    // Delete payments, order items and finally the order - must follow this order to avoid database errors
    await prisma.payment.deleteMany({ where: { orderId: id } });
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};