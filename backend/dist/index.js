"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./modules/app.module");
const PORT = process.env.PORT || 3000;
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.useGlobalPipes(new common_1.ValidationPipe()); // Global validation for DTOs
    app.enableShutdownHooks(); // Handle graceful shutdown
    await app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
}
bootstrap();
