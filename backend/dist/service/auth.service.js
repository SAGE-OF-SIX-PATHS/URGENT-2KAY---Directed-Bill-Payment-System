"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
class AuthService {
    async register(data) {
        const { name, email, password, role } = data;
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser)
            throw new Error("User already exists");
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "BENEFACTEE",
            },
        });
        const token = this.generateToken(user.id);
        return { message: "User registered", token, user };
    }
    async login(data) {
        const { email, password } = data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.password)
            throw new Error("Invalid credentials");
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch)
            throw new Error("Invalid credentials");
        const token = this.generateToken(user.id);
        return { message: "Login successful", token, user };
    }
    generateToken(userId) {
        return jsonwebtoken_1.default.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
    }
}
exports.AuthService = AuthService;
