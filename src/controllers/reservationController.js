import prisma from "../lib/prisma.js";
export const getReservations = async (req, res) => {
    try {
        const { branchId } = req.query;
        const reservations = await prisma.reservation.findMany({
            where: branchId ? { branchId: Number(branchId) } : {},
            include: {
                Branch: true,
                Table: true,
            },
        });
        res.status(200).json(reservations);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const createReservation = async (req, res) => {
    try {
        const { customerName, phone, guests, reservationDate, branchId } = req.body;
        // Criar customer automaticamente se não existir
        let customer = await prisma.customer.findFirst({
            where: { phone },
        });
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
        // Encontrar table disponível com capacidade suficiente
        const availableTable = await prisma.table.findFirst({
            where: {
                branchId: Number(branchId),
                status: "AVAILABLE",
                capacity: { gte: Number(guests) },
            },
            orderBy: {
                capacity: "asc",
            },
        });
        // Criar a reserva
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
        // Marcar table como OCCUPIED
        if (availableTable) {
            await prisma.table.update({
                where: { id: availableTable.id },
                data: { status: "OCCUPIED" },
            });
        }
        res.status(201).json(reservation);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const updateReservation = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const { customerName, phone, guests, reservationDate, status } = req.body;
        // Se cancelar reserva, libertar a table
        if (status === "CANCELLED") {
            const existing = await prisma.reservation.findUnique({ where: { id } });
            if (existing?.tableId) {
                await prisma.table.update({
                    where: { id: existing.tableId },
                    data: { status: "AVAILABLE" },
                });
            }
        }
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
export const deleteReservation = async (req, res) => {
    try {
        const id = Number(req.params.id);
        // Libertar table ao apagar reserva
        const existing = await prisma.reservation.findUnique({ where: { id } });
        if (existing?.tableId) {
            await prisma.table.update({
                where: { id: existing.tableId },
                data: { status: "AVAILABLE" },
            });
        }
        await prisma.reservation.delete({ where: { id } });
        res.status(200).json({ message: "Reservation deleted" });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
