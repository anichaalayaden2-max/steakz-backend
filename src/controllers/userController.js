import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
export const getUsers = async (req, res) => {
    try {
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const getUserById = async (req, res) => {
    try {
        const id = Number(req.params.id);
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
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const createUser = async (req, res) => {
    try {
        const { name, email, password, role, branchId } = req.body;
        // Encriptar a password
        const hashedPassword = await bcrypt.hash(password, 10);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const updateUser = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, email, role, branchId, password } = req.body;
        // Se vier nova password, encriptar
        let updateData = { name, email, role, branchId: Number(branchId) };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const deleteUser = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.user.delete({ where: { id } });
        res.status(200).json({ message: "User deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
