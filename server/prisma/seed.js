"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const client_1 = require("./client");
const createDbIfNotExists = async () => {
    const client = new pg_1.Client({
        user: 'postgres',
        host: 'localhost', // replace with your PostgreSQL host if needed
        password: '8663',
        port: 5432,
        database: 'postgres', // connect to default DB first
    });
    await client.connect();
    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='wwii'`);
    if (res.rowCount === 0) {
        await client.query('CREATE DATABASE wwii');
        console.log('Database "wwii" created.');
    }
    else {
        console.log('Database "wwii" already exists.');
    }
    await client.end();
};
const seedData = async () => {
    console.log("Seeding Entities...");
    // Create common Entities
    const alice = await client_1.prisma.entity.create({ data: { name: "Alice", type: "person" } });
    const london = await client_1.prisma.entity.create({ data: { name: "London", type: "location" } });
    const acme = await client_1.prisma.entity.create({ data: { name: "Acme Corp.", type: "organization" } });
    const date1 = await client_1.prisma.entity.create({ data: { name: "2025-04-30", type: "date", date: new Date("2025-04-30").toISOString() } });
    const paris = await client_1.prisma.entity.create({ data: { name: "Paris", type: "location" } });
    const bulge = await client_1.prisma.entity.create({ data: { name: "Battle of the Bulge", type: "event" } });
    const dailyNews = await client_1.prisma.entity.create({ data: { name: "Daily News", type: "organization" } });
    const date2 = await client_1.prisma.entity.create({ data: { name: "1944-06-06", type: "date", date: new Date("1944-06-06").toISOString() } });
    console.log("Seeding Documents...");
    // Document 1: letter
    await client_1.prisma.document.create({
        data: {
            title: "Letter from Alice",
            fileName: "letter_alice.txt",
            content: "This is a sample document of type letter.",
            documentType: "letter",
            entities: {
                connect: [{ id: alice.id }, { id: london.id }]
            }
        }
    });
    // Document 2: report
    await client_1.prisma.document.create({
        data: {
            title: "Acme Corp Report",
            fileName: "acme_report.pdf",
            content: "This is a sample document of type report.",
            documentType: "report",
            entities: {
                connect: [{ id: acme.id }, { id: date1.id }]
            }
        }
    });
    // Document 3: photo
    await client_1.prisma.document.create({
        data: {
            title: "Paris Photo",
            fileName: "paris_photo.jpg",
            content: "This is a sample document of type photo.",
            documentType: "photo",
            entities: {
                connect: [{ id: paris.id }]
            }
        }
    });
    // Document 4: diary_entry
    await client_1.prisma.document.create({
        data: {
            title: "Battle Diary Entry",
            fileName: "battle_diary.txt",
            content: "This is a sample document of type diary_entry.",
            documentType: "diary_entry",
            entities: {
                connect: [{ id: bulge.id }]
            }
        }
    });
    // Document 5: newspaper
    await client_1.prisma.document.create({
        data: {
            title: "Daily News Article",
            fileName: "daily_news.pdf",
            content: "This is a sample document of type newspaper.",
            documentType: "newspaper",
            entities: {
                connect: [{ id: dailyNews.id }, { id: date2.id }]
            }
        }
    });
    // Additional Document: list (with multiple entities)
    await client_1.prisma.document.create({
        data: {
            title: "Entity List",
            fileName: "entity_list.txt",
            content: "This is a sample document of type list.",
            documentType: "list",
            entities: {
                connect: [{ id: alice.id }, { id: acme.id }, { id: paris.id }]
            }
        }
    });
    // Additional Document: book
    await client_1.prisma.document.create({
        data: {
            title: "World War II History Book",
            fileName: "ww2_history.pdf",
            content: "This is a sample document of type book.",
            documentType: "book",
            entities: {
                connect: [{ id: bulge.id }, { id: date2.id }, { id: paris.id }]
            }
        }
    });
};
const fetchAndPrint = async () => {
    const documents = await client_1.prisma.document.findMany({
        include: {
            entities: true,
        },
    });
    console.log("Documents in DB:", documents);
};
const main = async () => {
    try {
        await createDbIfNotExists();
        // Apply Prisma schema changes
        console.log('Pushing Prisma schema...');
        await Promise.resolve().then(() => __importStar(require('child_process'))).then(({ execSync }) => {
            execSync('npx prisma db push', { stdio: 'inherit' });
        });
        await seedData();
        await fetchAndPrint();
    }
    catch (e) {
        console.error('Error:', e);
    }
    finally {
        await client_1.prisma.$disconnect();
    }
};
main();
