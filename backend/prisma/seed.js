import pkg from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();

const { PrismaClient } = pkg;
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL || 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data
  await prisma.favorite.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const password1 = await bcrypt.hash('password123', 10);
  const password2 = await bcrypt.hash('password456', 10);

  const user1 = await prisma.user.create({ data: { email: 'alice@example.com', name: 'Alice', password: password1 } });
  const user2 = await prisma.user.create({ data: { email: 'bob@example.com', name: 'Bob', password: password2 } });

  // Create products
  const productsData = Array.from({ length: 10 }).map((_, i) => ({
    title: `Product ${i + 1}`,
    price: Number(((i + 1) * 10.99).toFixed(2)),
    description: `This is the description for Product ${i + 1}. It is a great item you will love!`,
    image: `https://picsum.photos/seed/${i + 1}/400/300`,
  }));

  const products = await prisma.$transaction(
    productsData.map((data) => prisma.product.create({ data }))
  );

  // Favorite some products for user1 and user2
  await prisma.favorite.create({ data: { userId: user1.id, productId: products[0].id } });
  await prisma.favorite.create({ data: { userId: user1.id, productId: products[1].id } });
  await prisma.favorite.create({ data: { userId: user2.id, productId: products[2].id } });

  console.log('Seed completed. Test users:');
  console.log('alice@example.com / password123');
  console.log('bob@example.com / password456');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });