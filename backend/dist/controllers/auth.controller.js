"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginUser = exports.registerUser = void 0;
const auth_service_1 = require("../service/auth.service");
const authService = new auth_service_1.AuthService();
const registerUser = async (req, res) => {
    try {
        const result = await authService.register(req.body);
        res.status(201).json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.loginUser = loginUser;
