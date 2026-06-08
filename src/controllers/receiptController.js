import prisma from "../lib/prisma.js";
export const getReceipts = async (req, res) => {
    try {
        const { branchId } = req.query;
        const receipts = await prisma.receipt.findMany({
            include: {
                Payment: {
                    include: {
                        Order: {
                            include: {
                                Customer: true,
                                Table: true,
                                Branch: true,
                                OrderItem: {
                                    include: {
                                        MenuItem: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        // Filtrar por branchId se fornecido
        const filtered = branchId
            ? receipts.filter((r) => r.Payment?.Order?.branchId === Number(branchId))
            : receipts;
        res.status(200).json(filtered);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const getReceiptById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const receipt = await prisma.receipt.findUnique({
            where: { id },
            include: {
                Payment: {
                    include: {
                        Order: {
                            include: {
                                Customer: true,
                                Table: true,
                                Branch: true,
                                OrderItem: {
                                    include: {
                                        MenuItem: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        if (!receipt) {
            return res.status(404).json({ message: "Receipt not found" });
        }
        res.status(200).json(receipt);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const createReceipt = async (req, res) => {
    try {
        const { paymentId } = req.body;
        // Gerar receiptNumber automaticamente
        const count = await prisma.receipt.count();
        const receiptNumber = `REC-${String(count + 1).padStart(4, "0")}`;
        const receipt = await prisma.receipt.create({
            data: {
                receiptNumber,
                paymentId: Number(paymentId),
            },
            include: {
                Payment: {
                    include: {
                        Order: {
                            include: {
                                Customer: true,
                                Table: true,
                                Branch: true,
                                OrderItem: {
                                    include: {
                                        MenuItem: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        res.status(201).json(receipt);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const deleteReceipt = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.receipt.delete({ where: { id } });
        res.status(200).json({ message: "Receipt deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
