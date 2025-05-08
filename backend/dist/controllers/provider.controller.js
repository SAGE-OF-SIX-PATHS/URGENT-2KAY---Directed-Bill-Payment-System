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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderController = void 0;
const common_1 = require("@nestjs/common");
const provider_service_1 = require("../service/provider.service"); // Import ProvidersService
const CreatProviderDto_1 = require("../dto/CreatProviderDto");
let ProviderController = class ProviderController {
    constructor(providersService) {
        this.providersService = providersService;
    }
    // Endpoint to create a provider
    async create(body) {
        return this.providersService.create({ name: body.name });
    }
    // Endpoint to retrieve all providers
    async findAll() {
        return this.providersService.findAll();
    }
    // Endpoint to create provider with DTO
    async createWithDto(createProviderDto) {
        return this.providersService.create(createProviderDto);
    }
};
exports.ProviderController = ProviderController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "findAll", null);
__decorate([
    (0, common_1.Post)('with-dto'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreatProviderDto_1.CreateProviderDto]),
    __metadata("design:returntype", Promise)
], ProviderController.prototype, "createWithDto", null);
exports.ProviderController = ProviderController = __decorate([
    (0, common_1.Controller)('providers'),
    __metadata("design:paramtypes", [provider_service_1.ProvidersService])
], ProviderController);
