import prisma from "../lib/prisma.js";
export const getPayments = async (req, res) => {
    try {
        const { branchId } = req.query;
        const payments = await prisma.payment.findMany({
            where: branchId ? {
                Order: { branchId: Number(branchId) }
            } : {},
            include: {
                Order: {
                    include: {
                        Customer: true,
                        Table: true,
                        OrderItem: {
                            include: {
                                MenuItem: true,
                            },
                        },
                    },
                },
            },
        });
        res.status(200).json(payments);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const getPaymentById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const payment = await prisma.payment.findUnique({
            where: { id },
            include: {
                Order: {
                    include: {
                        Customer: true,
                        Table: true,
                        OrderItem: {
                            include: {
                                MenuItem: true,
                            },
                        },
                    },
                },
            },
        });
        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }
        res.status(200).json(payment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const createPayment = async (req, res) => {
    try {
        const { amount, method, status, orderId } = req.body;
        const payment = await prisma.payment.create({
            data: {
                amount: Number(amount),
                method,
                status,
                orderId: Number(orderId),
            },
        });
        res.status(201).json(payment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const updatePayment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { amount, method, status } = req.body;
        const payment = await prisma.payment.update({
            where: { id },
            data: { amount, method, status },
        });
        res.status(200).json(payment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const deletePayment = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.payment.delete({ where: { id } });
        res.status(200).json({ message: "Payment deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
