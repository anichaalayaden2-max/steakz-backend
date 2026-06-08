import prisma from "../lib/prisma.js";
export const getCustomers = async (req, res) => {
    try {
        const { branchId } = req.query;
        const customers = await prisma.customer.findMany({
            where: branchId ? { branchId: Number(branchId) } : {},
        });
        res.status(200).json(customers);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const getCustomerById = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const customer = await prisma.customer.findUnique({
            where: { id },
        });
        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }
        res.status(200).json(customer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const createCustomer = async (req, res) => {
    try {
        const { name, phone, email, branchId } = req.body;
        const customer = await prisma.customer.create({
            data: {
                name,
                phone,
                email: email || "",
                branchId: Number(branchId),
            },
        });
        res.status(201).json(customer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const updateCustomer = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { name, phone, email } = req.body;
        const customer = await prisma.customer.update({
            where: { id },
            data: { name, phone, email },
        });
        res.status(200).json(customer);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const deleteCustomer = async (req, res) => {
    try {
        const id = Number(req.params.id);
        await prisma.customer.delete({ where: { id } });
        res.status(200).json({ message: "Customer deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
