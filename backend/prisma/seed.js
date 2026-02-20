import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users with hashed passwords
  const usersData = [
    { email: 'alice@example.com', name: 'Alice', password: 'password123' },
    { email: 'bob@example.com', name: 'Bob', password: 'password123' },
  ];

  const users = [];
  for (const u of usersData) {
    const hash = await bcrypt.hash(u.password, 10);
    const user = await prisma.user.create({ data: { email: u.email, name: u.name, password: hash } });
    users.push(user);
  }

  // Create products
  const productsData = Array.from({ length: 20 }).map((_, i) => ({
    title: `Product ${i + 1}`,
    price: parseFloat((Math.random() * 100).toFixed(2)),
    description: `Description for product ${i + 1}`,
    image: `https://picsum.photos/seed/${i + 1}/400/300`,
  }));

  await prisma.product.createMany({ data: productsData });
  const created = await prisma.product.findMany();

  // Assign favorites
  for (const user of users) {
    const sample = created.sort(() => 0.5 - Math.random()).slice(0, 5);
    for (const p of sample) {
      await prisma.favorite.create({ data: { userId: user.id, productId: p.id } });
    }
  }

  console.log('Database seeded successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });