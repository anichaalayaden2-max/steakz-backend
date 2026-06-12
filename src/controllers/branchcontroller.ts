import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET ALL BRANCHES - Returns a list of all restaurant branches
export const getBranches = async (req: Request, res: Response) => {
  try {
    // Fetch all branches from the database - allows admin to see all locations
    const branches = await prisma.branch.findMany();

    res.status(200).json(branches);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// CREATE BRANCH - Adds a new restaurant branch to the system
export const createBranch = async (req: Request, res: Response) => {
  try {
    const { name, location, phone } = req.body;

    // Create the new branch in the database - allows the admin to expand to new locations
    const branch = await prisma.branch.create({
      data: { name, location, phone },
    });

    res.status(201).json(branch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// UPDATE BRANCH - Updates an existing branch's information
export const updateBranch = async (req: Request, res: Response) => {
  try {
    // Get the branch ID from the URL - identifies which branch to update
    const id = Number(req.params.id);

    const { name, location, phone } = req.body;

    // Update the branch details in the database - keeps branch information accurate
    const branch = await prisma.branch.update({
      where: { id },
      data: { name, location, phone },
    });

    res.status(200).json(branch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// DELETE BRANCH - Removes a branch from the system
export const deleteBranch = async (req: Request, res: Response) => {
  try {
    // Get the branch ID from the URL - identifies which branch to delete
    const id = Number(req.params.id);

    // Delete the branch from the database - removes closed or inactive locations
    await prisma.branch.delete({
      where: { id },
    });

    res.status(200).json({ message: "Branch deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};