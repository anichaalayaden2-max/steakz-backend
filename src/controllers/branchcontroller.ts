import { Request, Response } from "express";
import prisma from "../lib/prisma.js";

export const getBranches = async (
  req: Request,
  res: Response
) => {
  try {
    const branches =
      await prisma.branch.findMany();

    res.status(200).json(branches);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const createBranch = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, location, phone } =
      req.body;

    const branch =
      await prisma.branch.create({
        data: {
          name,
          location,
          phone,
        },
      });

    res.status(201).json(branch);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const updateBranch = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    const { name, location, phone } =
      req.body;

    const branch =
      await prisma.branch.update({
        where: { id },
        data: {
          name,
          location,
          phone,
        },
      });

    res.status(200).json(branch);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};

export const deleteBranch = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);

    await prisma.branch.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Branch deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
};