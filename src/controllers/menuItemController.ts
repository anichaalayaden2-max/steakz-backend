import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET ALL MENU ITEMS - Returns menu items filtered by branch
export const getMenuItems = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    // Filter menu items by branchId if provided - ensures each branch only sees its own menu
    const items = await prisma.menuItem.findMany({
      where: branchId ? { branchId: Number(branchId) } : {},
      include: {
        Branch: true, // Include branch details in the response
      },
    });

    res.status(200).json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET MENU ITEM BY ID - Returns a single menu item by its ID
export const getMenuItemById = async (req: Request, res: Response) => {
  try {
    // Get the menu item ID from the URL - identifies which item to retrieve
    const id = Number(req.params.id);

    const item = await prisma.menuItem.findUnique({
      where: { id },
      include: {
        Branch: true, // Include branch details in the response
      },
    });

    // Return 404 if item does not exist - prevents returning empty data
    if (!item) {
      return res.status(404).json({ message: "Menu item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE MENU ITEM - Adds a new dish to the branch menu
export const createMenuItem = async (req: Request, res: Response) => {
  try {
    const { name, description, price, image, category, branchId } = req.body;

    // Save the new menu item linked to a specific branch - keeps each branch menu separate
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

// UPDATE MENU ITEM - Updates an existing menu item's details
export const updateMenuItem = async (req: Request, res: Response) => {
  try {
    // Get the menu item ID from the URL - identifies which item to update
    const id = Number(req.params.id);
    const { name, description, price, image, category, branchId } = req.body;

    // Update only the fields that were provided - allows partial updates without overwriting existing data
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

// DELETE MENU ITEM - Removes a menu item from the system
export const deleteMenuItem = async (req: Request, res: Response) => {
  try {
    // Get the menu item ID from the URL - identifies which item to delete
    const id = Number(req.params.id);

    // Delete all order items linked to this menu item first - prevents database errors caused by foreign key constraints
    await prisma.orderItem.deleteMany({
      where: { menuItemId: id },
    });

    // Now safely delete the menu item - removes dishes that are no longer available
    await prisma.menuItem.delete({
      where: { id },
    });

    res.status(200).json({ message: "Menu item deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};