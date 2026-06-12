import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// REGISTER - Creates a new user in the system
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, branchId } = req.body;

    // Check if email is already registered - prevents duplicate accounts in the system
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Encrypt the password before saving - protects user data if the database is ever compromised
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the new user to the database - stores all user information securely
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        branchId,
      },
    });

    // Remove password from the response - never send passwords back to the client for security
    const { password: _, ...userWithoutPassword } = user;

    return res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};

// LOGIN - Authenticates a user and returns a JWT token
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Search for the user by email including their branch - needed to return branch name after login
    const user = await prisma.user.findUnique({
      where: { email },
      include: { Branch: true },
    });

    // If user does not exist, return error - prevents unauthorized access to the system
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the entered password with the encrypted password - verifies the user is who they claim to be
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token with the user id, role and branchId - allows the user to make authenticated requests without logging in again
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        branchId: user.branchId,
      },
      process.env.JWT_SECRET || "steakz-secret",
      { expiresIn: "1d" }
    );

    // Remove password from the response - never expose passwords in API responses
    const { password: _, ...userWithoutPassword } = user;

    return res.status(200).json({
      token,
      user: userWithoutPassword,
      branchId: user.branchId || null,
      branchName: user.Branch?.name || null,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};