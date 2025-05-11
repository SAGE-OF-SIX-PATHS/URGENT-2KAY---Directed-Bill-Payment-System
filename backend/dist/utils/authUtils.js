"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findOrCreateUser = void 0;
// src/utils/authUtils.ts (or similar)
const prisma_1 = require("../lib/prisma"); // adjust path as needed
const findOrCreateUser = async (profile, role) => {
    const email = profile.emails[0].value;
    const googleId = profile.id;
    let user = await prisma_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        user = await prisma_1.prisma.user.create({
            data: {
                email,
                name: profile.displayName,
                googleId,
                role: role.toUpperCase(),
            },
        });
    }
    return user;
};
exports.findOrCreateUser = findOrCreateUser;
