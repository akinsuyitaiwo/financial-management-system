// seeders/seed-groups.ts
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function seedGroups() {
  try {
    // Define the groups to be seeded
    const groups = [
      { id: uuidv4(), name: 'Family Finances' },
      { id: uuidv4(), name: 'Project Budget' },
      { id: uuidv4(), name: 'Travel Expenses' },
    ];

    // Insert groups into the database
    for (const group of groups) {
      await prisma.group.create({
        data: group,
      });
      console.log(`Created group: ${group.name}`);
    }

    console.log('Group seeding completed successfully.');
  } catch (error) {
    console.error('Error seeding groups:', error);
  } finally {
    await prisma.$disconnect(); // Disconnect Prisma client
  }
}

// Run the seeder
seedGroups();
