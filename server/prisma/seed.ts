import { Client } from 'pg';
import { prisma } from './client';
import bcrypt from 'bcrypt';

const createDbIfNotExists = async () => {
    const client = new Client({
        user: 'postgres',
        host: 'localhost', // replace with your PostgreSQL host if needed
        password: '8663',
        port: 5432,
        database: 'postgres', // connect to default DB first
    });

    await client.connect();

    const res = await client.query(`SELECT 1 FROM pg_database WHERE datname='mydb'`);
    if (res.rowCount === 0) {
        await client.query('CREATE DATABASE mydb');
        console.log('Database "mydb" created.');
    } else {
        console.log('Database "mydb" already exists.');
    }

    await client.end();
};

const seedData = async () => {
    console.log("Seeding Users...");
    
    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: adminPassword,
            name: 'Admin User',
            role: 'ADMIN',
            isActive: true,
        },
    });
    console.log('Created admin user:', admin.email);

    // Create default regular user
    const userPassword = await bcrypt.hash('user123', 12);
    const user = await prisma.user.upsert({
        where: { email: 'user@example.com' },
        update: {},
        create: {
            email: 'user@example.com',
            password: userPassword,
            name: 'Regular User',
            role: 'USER',
            isActive: true,
        },
    });
    console.log('Created regular user:', user.email);

    console.log("Seeding Entities...");
    // Create common Entities
    const alice   = await prisma.entity.create({ data: { name: "Alice", type: "person" } });
    const london  = await prisma.entity.create({ data: { name: "London", type: "location" } });
    const acme    = await prisma.entity.create({ data: { name: "Acme Corp.", type: "organization" } });
    const date1   = await prisma.entity.create({ data: { name: "2025-04-30", type: "date", date: new Date("2025-04-30").toISOString() } });
    const paris   = await prisma.entity.create({ data: { name: "Paris", type: "location" } });
    const bulge   = await prisma.entity.create({ data: { name: "Battle of the Bulge", type: "event" } });
    const dailyNews = await prisma.entity.create({ data: { name: "Daily News", type: "organization" } });
    const date2   = await prisma.entity.create({ data: { name: "1944-06-06", type: "date", date: new Date("1944-06-06").toISOString() } });

    console.log("Seeding Documents...");
    // Document 1: letter
    await prisma.document.create({
        data: {
            title: "Letter from Alice",
            fileName: "letter_alice.txt",
            content: "This is a sample document of type letter.",
            documentType: "letter",
            fileId: "sample_file_1",
            mimeType: "text/plain",
            fileSize: 1024,
            entities: {
                connect: [{ id: alice.id }, { id: london.id }]
            }
        }
    });

    // Document 2: report
    await prisma.document.create({
        data: {
            title: "Acme Corp Report",
            fileName: "acme_report.pdf",
            content: "This is a sample document of type report.",
            documentType: "report",
            fileId: "sample_file_2",
            mimeType: "application/pdf",
            fileSize: 2048,
            entities: {
                connect: [{ id: acme.id }, { id: date1.id }]
            }
        }
    });

    // Document 3: photo
    await prisma.document.create({
        data: {
            title: "Paris Photo",
            fileName: "paris_photo.jpg",
            content: "This is a sample document of type photo.",
            documentType: "photo",
            fileId: "sample_file_3",
            mimeType: "image/jpeg",
            fileSize: 4096,
            entities: {
                connect: [{ id: paris.id }]
            }
        }
    });

    // Document 4: diary_entry
    await prisma.document.create({
        data: {
            title: "Battle Diary Entry",
            fileName: "battle_diary.txt",
            content: "This is a sample document of type diary_entry.",
            documentType: "diary_entry",
            fileId: "sample_file_4",
            mimeType: "text/plain",
            fileSize: 1536,
            entities: {
                connect: [{ id: bulge.id }]
            }
        }
    });

    // Document 5: newspaper
    await prisma.document.create({
        data: {
            title: "Daily News Article",
            fileName: "daily_news.pdf",
            content: "This is a sample document of type newspaper.",
            documentType: "newspaper",
            fileId: "sample_file_5",
            mimeType: "application/pdf",
            fileSize: 3072,
            entities: {
                connect: [{ id: dailyNews.id }, { id: date2.id }]
            }
        }
    });

    // Additional Document: list (with multiple entities)
    await prisma.document.create({
        data: {
            title: "Entity List",
            fileName: "entity_list.txt",
            content: "This is a sample document of type list.",
            documentType: "list",
            fileId: "sample_file_6",
            mimeType: "text/plain",
            fileSize: 512,
            entities: {
                connect: [{ id: alice.id }, { id: acme.id }, { id: paris.id }]
            }
        }
    });

    // Additional Document: book
    await prisma.document.create({
        data: {
            title: "World War II History Book",
            fileName: "ww2_history.pdf",
            content: "This is a sample document of type book.",
            documentType: "book",
            fileId: "sample_file_7",
            mimeType: "application/pdf",
            fileSize: 8192,
            entities: {
                connect: [{ id: bulge.id }, { id: date2.id }, { id: paris.id }]
            }
        }
    });
};

const fetchAndPrint = async () => {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
        },
    });
    console.log("Users in DB:", users);

    const documents = await prisma.document.findMany({
        include: {
            entities: true,
        },
    });
    console.log("Documents in DB:", documents.length);
};

const main = async () => {
    try {
        await createDbIfNotExists();

        // Apply Prisma schema changes
        console.log('Pushing Prisma schema...');
        await import('child_process').then(({ execSync }) => {
            execSync('npx prisma db push', { stdio: 'inherit' });
        });

        await seedData();
        await fetchAndPrint();
        
        console.log('\n=== Default Users Created ===');
        console.log('Admin User:');
        console.log('  Email: admin@example.com');
        console.log('  Password: admin123');
        console.log('  Role: ADMIN');
        console.log('\nRegular User:');
        console.log('  Email: user@example.com');
        console.log('  Password: user123');
        console.log('  Role: USER');
        console.log('================================\n');
        
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
};

main();