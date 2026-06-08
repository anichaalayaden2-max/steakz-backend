import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
export const register = async (req, res) => {
    try {
        const { name, email, password, role, branchId, } = req.body;
        const existingUser = await prisma.user.findUnique({
            where: {
                email,
            },
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User already exists",
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                branchId,
            },
        });
        const { password: _, ...userWithoutPassword } = user;
        return res.status(201).json({
            message: "User created successfully",
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password, } = req.body;
        const user = await prisma.user.findUnique({
            where: {
                email,
            },
            include: {
                Branch: true,
            },
        });
        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }
        const token = jwt.sign({
            id: user.id,
            role: user.role,
            branchId: user.branchId,
        }, process.env.JWT_SECRET ||
            "steakz-secret", {
            expiresIn: "1d",
        });
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
            token,
            user: userWithoutPassword,
            branchId: user.branchId ||
                null,
            branchName: user.Branch?.name ||
                null,
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error",
        });
    }
};
