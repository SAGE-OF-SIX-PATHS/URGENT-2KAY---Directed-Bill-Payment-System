"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const prisma_module_1 = require("./prisma.module"); // Import PrismaModule
const bill_controller_1 = require("../controllers/bill.controller");
const app_controller_1 = require("../controllers/app.controller");
const provider_controller_1 = require("../controllers/provider.controller");
const bill_module_1 = require("./bill.module");
const provider_module_1 = require("./provider.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, bill_module_1.BillModule, provider_module_1.ProviderModule], // Add PrismaModule here
        controllers: [app_controller_1.AppController, bill_controller_1.BillController, provider_controller_1.ProviderController],
        providers: [],
    })
], AppModule);
