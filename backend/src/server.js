import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pkg from '@prisma/client';
import { z } from 'zod';

dotenv.config();

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

app.use(cors());
app.use(express.json());

// Utility: auth middleware
function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
const productSchema = z.object({
  title: z.string().min(1),
  price: z.number().nonnegative(),
  description: z.string().min(1),
  image: z.string().url(),
});

// Auth routes
app.post('/auth/register', async (req, res) => {
  const parse = registerSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { email, password, name } = parse.data;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(409).json({ error: 'Email already registered' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, password: hash, name } });
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/auth/login', async (req, res) => {
  const parse = loginSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const { email, password } = parse.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// Products CRUD with search + pagination
app.get('/products', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const q = (req.query.q || '').toString();
  const skip = (page - 1) * limit;
  const where = q
    ? { OR: [ { title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } } ] }
    : {};
  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where })
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

app.get('/products/:id', async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ error: 'Not found' });
  res.json(product);
});

app.post('/products', auth, async (req, res) => {
  const parse = productSchema.safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  const product = await prisma.product.create({ data: parse.data });
  res.status(201).json(product);
});

app.put('/products/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  const parse = productSchema.partial().safeParse(req.body);
  if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
  try {
    const product = await prisma.product.update({ where: { id }, data: parse.data });
    res.json(product);
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

app.delete('/products/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'Not found' });
  }
});

// Favorites
app.post('/favorites/:productId', auth, async (req, res) => {
  const productId = Number(req.params.productId);
  try {
    const fav = await prisma.favorite.create({ data: { productId, userId: req.user.userId } });
    res.status(201).json(fav);
  } catch (e) {
    res.status(400).json({ error: 'Already favorited or invalid product' });
  }
});

app.delete('/favorites/:productId', auth, async (req, res) => {
  const productId = Number(req.params.productId);
  try {
    await prisma.favorite.delete({ where: { userId_productId: { userId: req.user.userId, productId } } });
    res.status(204).send();
  } catch (e) {
    res.status(404).json({ error: 'Favorite not found' });
  }
});

app.get('/me/favorites', auth, async (req, res) => {
  const favorites = await prisma.favorite.findMany({
    where: { userId: req.user.userId },
    include: { product: true },
  });
  res.json(favorites.map(f => f.product));
});

app.get('/', (_req, res) => res.send('Marketplace API running'));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});