import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    const items = await prisma.menuItem.findMany({
      where: branchId ? { branchId: Number(branchId) } : {},
      include: {
        Branch: true,
      },
    });

    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        Branch: true,
      },
    });

    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, category, branchId } = req.body;

    const item = await prisma.menuItem.create({
      data: {
        name,
        description,
        price: Number(price),
        image,
        category,
        branchId: Number(branchId),
      },
    });

    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, description, price, image, category, branchId } = req.body;

    const item = await prisma.menuItem.update({
      where: { id },
      data: {
        name,
        description,
        price: price !== undefined ? Number(price) : undefined,
        image,
        category,
        branchId: branchId !== undefined ? Number(branchId) : undefined,
      },
    });

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    // Apagar OrderItems ligados primeiro
    await prisma.orderItem.deleteMany({
      where: { menuItemId: id },
    });

    await prisma.menuItem.delete({
      where: { id },
    });

    res.status(200).json({ message: "Menu item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};