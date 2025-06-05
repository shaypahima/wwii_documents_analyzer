"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
class DatabaseClient {
    static getInstance() {
        if (!DatabaseClient.instance) {
            DatabaseClient.instance = new client_1.PrismaClient({
                log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
                errorFormat: 'pretty',
            });
        }
        return DatabaseClient.instance;
    }
    static async disconnect() {
        if (DatabaseClient.instance) {
            await DatabaseClient.instance.$disconnect();
        }
    }
}
exports.prisma = DatabaseClient.getInstance();
