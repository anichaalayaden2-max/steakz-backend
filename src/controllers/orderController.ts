import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getOrders = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    const orders = await prisma.order.findMany({
      where: branchId ? { branchId: Number(branchId) } : {},
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

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
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

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createOrder = async (req: Request, res: Response) => {
  try {
    const {
      status,
      totalAmount,
      customerId,
      branchId,
      tableId,
      waiterId,
      items,
    } = req.body;

    // Buscar do token
    const decoded = (req as any).user;
    const resolvedWaiterId = decoded?.id 
      ? Number(decoded.id) 
      : Number(waiterId);

    console.log("decoded user:", decoded);
    console.log("resolvedWaiterId:", resolvedWaiterId);

    const order = await prisma.order.create({
      data: {
        status,
        totalAmount: Number(totalAmount),
        Customer: { connect: { id: Number(customerId) } },
        Branch: { connect: { id: Number(branchId) } },
        User: { connect: { id: resolvedWaiterId } },
        Table: { connect: { id: Number(tableId) } },
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

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { status, totalAmount } = req.body;

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

export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const payments = await prisma.payment.findMany({ where: { orderId: id } });

    for (const payment of payments) {
      await prisma.receipt.deleteMany({ where: { paymentId: payment.id } });
    }

    await prisma.payment.deleteMany({ where: { orderId: id } });
    await prisma.orderItem.deleteMany({ where: { orderId: id } });
    await prisma.order.delete({ where: { id } });

    res.status(200).json({ message: "Order deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete order" });
  }
};