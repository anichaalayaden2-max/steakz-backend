import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

// GET ALL RESERVATIONS - Returns reservations filtered by branch
export const getReservations = async (req: Request, res: Response) => {
  try {
    const { branchId } = req.query;

    // Filter reservations by branchId if provided - ensures each branch only sees its own reservations
    const reservations = await prisma.reservation.findMany({
      where: branchId ? { branchId: Number(branchId) } : {},
      include: {
        Branch: true, // Include branch details
        Table: true,  // Include table details to show which table was assigned
      },
    });

    res.status(200).json(reservations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// CREATE RESERVATION - Creates a new reservation and automatically assigns a table
export const createReservation = async (req: Request, res: Response) => {
  try {
    const { customerName, phone, guests, reservationDate, branchId } = req.body;

    // Check if customer already exists by phone number - avoids creating duplicate customers
    let customer = await prisma.customer.findFirst({
      where: { phone },
    });

    // If customer does not exist, create them automatically - saves staff from manually adding customers
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          name: customerName,
          phone,
          email: "",
          branchId: Number(branchId),
        },
      });
    }

    // Find the smallest available table that fits the number of guests - optimises table usage in the restaurant
    const availableTable = await prisma.table.findFirst({
      where: {
        branchId: Number(branchId),
        status: "AVAILABLE",
        capacity: { gte: Number(guests) },
      },
      orderBy: {
        capacity: "asc", // Get the smallest suitable table first
      },
    });

    // Create the reservation linked to the branch and assigned table
    const reservation = await prisma.reservation.create({
      data: {
        customerName,
        phone,
        guests: Number(guests),
        reservationDate: new Date(reservationDate),
        branchId: Number(branchId),
        tableId: availableTable ? availableTable.id : null,
      },
      include: {
        Table: true,
      },
    });

    // Mark the assigned table as OCCUPIED - prevents the same table being booked twice
    if (availableTable) {
      await prisma.table.update({
        where: { id: availableTable.id },
        data: { status: "OCCUPIED" },
      });
    }

    res.status(201).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// UPDATE RESERVATION - Updates an existing reservation's details
export const updateReservation = async (req: Request, res: Response) => {
  try {
    // Get the reservation ID from the URL - identifies which reservation to update
    const id = Number(req.params.id);
    const { customerName, phone, guests, reservationDate, status } = req.body;

    // If reservation is cancelled, release the table back to AVAILABLE - allows the table to be used by other customers
    if (status === "CANCELLED") {
      const existing = await prisma.reservation.findUnique({ where: { id } });
      if (existing?.tableId) {
        await prisma.table.update({
          where: { id: existing.tableId },
          data: { status: "AVAILABLE" },
        });
      }
    }

    // Update the reservation with the new details
    const reservation = await prisma.reservation.update({
      where: { id },
      data: {
        customerName,
        phone,
        guests: guests !== undefined ? Number(guests) : undefined,
        reservationDate: reservationDate ? new Date(reservationDate) : undefined,
        status,
      },
      include: {
        Table: true,
      },
    });

    res.status(200).json(reservation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE RESERVATION - Removes a reservation and releases the table
export const deleteReservation = async (req: Request, res: Response) => {
  try {
    // Get the reservation ID from the URL - identifies which reservation to delete
    const id = Number(req.params.id);

    // Release the table back to AVAILABLE before deleting - ensures the table can be used again
    const existing = await prisma.reservation.findUnique({ where: { id } });
    if (existing?.tableId) {
      await prisma.table.update({
        where: { id: existing.tableId },
        data: { status: "AVAILABLE" },
      });
    }

    // Delete the reservation from the database - removes cancelled or incorrect bookings
    await prisma.reservation.delete({ where: { id } });

    res.status(200).json({ message: "Reservation deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};