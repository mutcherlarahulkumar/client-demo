"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
async function main() {
    const email = process.env.SEED_ADMIN_EMAIL;
    const password = process.env.SEED_ADMIN_PASSWORD;
    const name = process.env.SEED_ADMIN_NAME ?? "Admin";
    if (!email || !password) {
        throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env to run the seed script.");
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        console.log(`[seed] Admin user ${email} already exists — skipping.`);
        return;
    }
    const passwordHash = await bcryptjs_1.default.hash(password, SALT_ROUNDS);
    await prisma.user.create({
        data: { name, email, passwordHash, role: client_1.Role.ADMIN },
    });
    console.log(`[seed] Created initial admin user: ${email}`);
}
main()
    .catch((err) => {
    console.error(err);
    process.exitCode = 1;
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map