"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../service/prisma.service");
const APPROVED_PROVIDERS = ['NEPA', 'MTN', 'GLO', 'University of Lagos'];
let BillService = class BillService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        if (!APPROVED_PROVIDERS.includes(dto.provider)) {
            throw new Error('Provider not approved');
        }
        const { customerName, provider, amount, dueDate } = dto;
        return this.prisma.bill.create({
            data: {
                customerName, provider, amount, dueDate,
                userId,
                status: 'PENDING',
            },
        });
    }
    async findAll(userId) {
        return this.prisma.bill.findMany({ where: { userId } });
    }
    async findOne(userId, id) {
        return this.prisma.bill.findFirst({ where: { id, userId } });
    }
    async update(userId, id, dto) {
        const bill = await this.findOne(userId, id);
        if (!bill)
            throw new common_1.NotFoundException('Bill not found');
        return this.prisma.bill.update({ where: { id }, data: dto });
    }
    async remove(userId, id) {
        const bill = await this.findOne(userId, id);
        if (!bill)
            throw new common_1.NotFoundException('Bill not found');
        return this.prisma.bill.delete({ where: { id } });
    }
};
exports.BillService = BillService;
exports.BillService = BillService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillService);
