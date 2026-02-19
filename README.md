# Micro Marketplace App

A small full‑stack Micro Marketplace featuring a Node.js/Express backend with SQLite/Prisma and a React web app.

## Features
- JWT auth: POST /auth/register, POST /auth/login
- Products: CRUD (title, price, description, image)
- Search + pagination: GET /products?page=&limit=&q=
- Favorites: add/remove and list current user favorites
- Validation with Zod, password hashing with bcrypt
- Seed data: 10 products, 2 users
- Web app: login/register, product list with search & pagination, product detail, favorite/unfavorite
- Clean responsive UI + heart pulse micro‑interaction

## Tech Stack
- Backend: Node.js, Express, Prisma (Better‑SQLite3 adapter), Zod, JWT, bcrypt
- Database: SQLite (file DB)
- Web: React + Vite, React Router, Axios

## Prerequisites
- Node.js 18+
- npm

## Getting Started (Local)

### 1) Backend
```
cd backend
npm install
# Ensure .env exists (already provided). If missing, create:
# DATABASE_URL=file:./dev.db
# JWT_SECRET=dev_secret_change_me
npm run migrate
npm run seed
npm run dev
```
The API will be available at http://localhost:4000/

Seeded users:
- alice@example.com / password123
- bob@example.com / password456

### 2) Web
```
cd web
npm install
npm run dev
```
Open http://localhost:5173/ (Vite dev). The Vite dev proxy forwards `/api` to the backend at http://localhost:4000.

## API Overview

Base URL (dev): http://localhost:4000

Auth
- POST /auth/register
  - body: { email, password, name? }
  - 201 -> { token, user }
- POST /auth/login
  - body: { email, password }
  - 200 -> { token, user }

Products
- GET /products?page=&limit=&q=
  - 200 -> { items: Product[], total, page, pages }
- GET /products/:id
- POST /products (auth)
- PUT /products/:id (auth)
- DELETE /products/:id (auth)

Favorites (auth)
- POST /favorites/:productId
- DELETE /favorites/:productId
- GET /me/favorites -> Product[]

Auth header (for protected routes):
```
Authorization: Bearer <JWT>
```

## Project Structure
```
backend/
  src/server.js
  prisma/schema.prisma
  prisma/seed.js
  prisma.config.ts
web/
  src/main.jsx
  src/routes/*
  src/api/client.js
  vite.config.js
```

## Deployment Notes
- Backend: Deploy to your Node host (e.g., Render). Set env vars DATABASE_URL and JWT_SECRET. Start with `node src/server.js`.
- Web: Deploy static build (e.g., Vercel/Netlify) with `npm run build`. For production, ensure your web app can reach the backend (via reverse proxy or by configuring the API base URL). The dev setup uses a Vite proxy for `/api`.

## GitHub & Deliverables
- Initialize a Git repo in the project root and push to GitHub.
- Include this README and keep `.env` out of version control.
- Provide a short 3–5 minute demo video walking through signup/login, product browsing, search/pagination, detail view, and favorites.

### Example Git commands
```
# from project root
git init
git checkout -b main
git add .
git commit -m "Initial commit: backend and web"
# then create a GitHub repo and run:
# git remote add origin https://github.com/<your-username>/<repo-name>.git
# git push -u origin main
```