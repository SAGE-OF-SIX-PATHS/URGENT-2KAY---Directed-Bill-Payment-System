"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sponsorBill = exports.deleteBill = exports.updateBill = exports.getBillById = exports.getAllBills = exports.createBill = void 0;
const prisma_1 = require("../lib/prisma");
const createBill = async (req, res) => {
    try {
        const userId = req.user?.id; // `req.user` is set by auth middleware
        if (!userId) {
            res.status(401).json({ error: "Unauthorized user" });
            return;
        }
        const { billName, type, amount, note, dueDate, priority, providerId } = req.body;
        // Manual input validation
        if (!billName || !type || !amount) {
            res.status(400).json({
                error: "billName, type, and amount are required",
            });
            return;
        }
        // Optional: Validate provider exists
        let provider = null;
        if (providerId) {
            provider = await prisma_1.prisma.provider.findUnique({ where: { id: providerId } });
            if (!provider) {
                res.status(404).json({ error: "Invalid provider ID" });
                return;
            }
        }
        const bill = await prisma_1.prisma.bill.create({
            data: {
                billName,
                type,
                amount: parseFloat(amount),
                note,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                priority: priority || "MEDIUM",
                userId,
                providerId: provider?.id,
            },
        });
        res.status(201).json({ message: "Bill created successfully", bill });
    }
    catch (error) {
        console.error("Create Bill Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.createBill = createBill;
// GET /bills — get all bills for logged-in user
const getAllBills = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const bills = await prisma_1.prisma.bill.findMany({
            where: { userId },
            include: { provider: true },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({ bills });
    }
    catch (error) {
        console.error("Error fetching bills:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getAllBills = getAllBills;
// GET /bills/:id — get a specific bill by ID
const getBillById = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const bill = await prisma_1.prisma.bill.findUnique({
            where: { id },
            include: { provider: true },
        });
        if (!bill || bill.userId !== userId) {
            res.status(404).json({ error: "Bill not found" });
            return;
        }
        res.status(200).json({ bill });
    }
    catch (error) {
        console.error("Error fetching bill:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.getBillById = getBillById;
// Update an existing bill
const updateBill = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { billName, type, amount, note, dueDate, priority, providerId } = req.body;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const existingBill = await prisma_1.prisma.bill.findUnique({ where: { id } });
        if (!existingBill || existingBill.userId !== userId) {
            res.status(404).json({ error: "Bill not found or unauthorized" });
            return;
        }
        // Optional: Validate new provider ID if changed
        let provider = null; // 
        if (providerId) {
            provider = await prisma_1.prisma.provider.findUnique({ where: { id: providerId } });
            if (!provider) {
                res.status(404).json({ error: "Invalid provider ID" });
                return;
            }
        }
        const updatedBill = await prisma_1.prisma.bill.update({
            where: { id },
            data: {
                billName,
                type,
                amount: amount ? parseFloat(amount) : undefined,
                note,
                dueDate: dueDate ? new Date(dueDate) : undefined,
                priority,
                providerId: provider?.id,
            },
        });
        res.status(200).json({ message: "Bill updated successfully", bill: updatedBill });
    }
    catch (error) {
        console.error("Error updating bill:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.updateBill = updateBill;
// Delete an existing bill
const deleteBill = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }
        const bill = await prisma_1.prisma.bill.findUnique({ where: { id } });
        if (!bill || bill.userId !== userId) {
            res.status(404).json({ error: "Bill not found or unauthorized" });
            return;
        }
        await prisma_1.prisma.bill.delete({ where: { id } });
        res.status(200).json({ message: "Bill deleted successfully" });
    }
    catch (error) {
        console.error("Error deleting bill:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
exports.deleteBill = deleteBill;
const sponsorBill = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { billId } = req.params;
        const { amount } = req.body;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized user" });
            return;
        }
        if (!amount || isNaN(amount)) {
            res.status(400).json({ error: "Amount is required and must be a number" });
            return;
        }
        const bill = await prisma_1.prisma.bill.findUnique({
            where: { id: billId },
            include: { sponsors: true, transactions: true }
        });
        if (!bill) {
            res.status(404).json({ error: "Bill not found" });
            return;
        }
        const isAlreadySponsor = bill.sponsors.some(sponsor => sponsor.id === userId);
        if (!isAlreadySponsor) {
            await prisma_1.prisma.bill.update({
                where: { id: billId },
                data: {
                    sponsors: {
                        connect: { id: userId }
                    }
                }
            });
        }
        const transaction = await prisma_1.prisma.transaction.create({
            data: {
                amount: parseFloat(amount),
                status: "SUCCESS",
                billId,
                reference: `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`
            }
        });
        res.status(201).json({
            message: "Sponsorship successful",
            transaction
        });
    }
    catch (error) {
        console.error("Sponsor bill error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};
exports.sponsorBill = sponsorBill;
