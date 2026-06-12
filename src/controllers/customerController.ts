import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET ALL CUSTOMERS - Returns customers filtered by branch
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    // Filter customers by branchId if provided - ensures each branch only sees its own customers
    const customers = await prisma.customer.findMany({
      where: branchId ? { branchId: Number(branchId) } : {},
    });

    res.status(200).json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET CUSTOMER BY ID - Returns a single customer by their ID
export const getCustomerById = async (req: Request, res: Response) => {
  try {
    // Get the customer ID from the URL - identifies which customer to retrieve
    const id = Number(req.params.id);

    const customer = await prisma.customer.findUnique({
      where: { id },
    });

    // Return 404 if customer does not exist - prevents returning empty data
    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE CUSTOMER - Adds a new customer to the branch
export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, phone, email, branchId } = req.body;

    // Save the new customer linked to a specific branch - keeps customer data organised per location
    const customer = await prisma.customer.create({
      data: {
        name,
        phone,
        email: email || "",
        branchId: Number(branchId),
      },
    });

    res.status(201).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE CUSTOMER - Updates an existing customer's information
export const updateCustomer = async (req: Request, res: Response) => {
  try {
    // Get the customer ID from the URL - identifies which customer to update
    const id = Number(req.params.id);
    const { name, phone, email } = req.body;

    // Update the customer details in the database - keeps customer information up to date
    const customer = await prisma.customer.update({
      where: { id },
      data: { name, phone, email },
    });

    res.status(200).json(customer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE CUSTOMER - Removes a customer from the system
export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    // Get the customer ID from the URL - identifies which customer to delete
    const id = Number(req.params.id);

    // Delete the customer from the database - removes customers that are no longer active
    await prisma.customer.delete({ where: { id } });

    res.status(200).json({ message: "Customer deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};