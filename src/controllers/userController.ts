import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";

// GET ALL USERS - Returns all users without their passwords
export const getUsers = async (req: Request, res: Response) => {
  try {
    // Fetch all users but exclude the password field - never expose passwords in API responses
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        branchId: true,
      },
    });

    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET USER BY ID - Returns a single user by their ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the URL - identifies which user to retrieve
    const id = Number(req.params.id);

    // Fetch user without password - keeps sensitive data secure
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        branchId: true,
      },
    });

    // Return 404 if user does not exist - prevents returning empty data
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE USER - Adds a new staff member to the system
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, branchId } = req.body;

    // Encrypt the password before saving - protects user data if the database is ever compromised
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user and return without password - keeps sensitive data secure
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        branchId: Number(branchId),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        branchId: true,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE USER - Updates an existing staff member's details
export const updateUser = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the URL - identifies which user to update
    const id = Number(req.params.id);
    const { name, email, role, branchId, password } = req.body;

    // Prepare the update data without password by default
    let updateData: any = { name, email, role, branchId: Number(branchId) };

    // If a new password is provided, encrypt it before saving - ensures passwords are always stored securely
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update the user and return without password - keeps sensitive data secure
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        branchId: true,
      },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE USER - Removes a staff member from the system
export const deleteUser = async (req: Request, res: Response) => {
  try {
    // Get the user ID from the URL - identifies which user to delete
    const id = Number(req.params.id);

    // Delete the user from the database - removes staff members that have left the company
    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: "User deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};