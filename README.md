# PromptVault

PromptVault is a Next.js 16 app for saving, organizing, searching, and sharing prompts.

## Stack

- Next.js 16, React 19, TypeScript
- Tailwind CSS 4
- PostgreSQL
- Prisma 7
- NextAuth

## Local Setup

Install dependencies:

```bash
npm install
```

Start the local Prisma Postgres server:

```bash
npm run db:dev
```

If the `promptvault` Prisma Dev server does not exist yet, create it first:

```bash
npm run db:dev:new
```

Copy the `prisma+postgres://...` connection string printed by Prisma into `DATABASE_URL` in `.env` if the ports differ from your current file. Copy the regular `postgres://...` connection string into `DIRECT_DATABASE_URL`; the app uses it through `@prisma/adapter-pg`.

Apply the database schema locally:

```bash
npm run db:push
```

Run the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database Commands

```bash
npm run db:status
npm run db:push
npm run db:migrate -- --name your_migration_name
npm run db:deploy
npm run db:generate
npm run db:studio
npm run db:stop
```

The initial SQL migration is versioned at `prisma/migrations/20260418204000_init/migration.sql`. Use Prisma Migrate against a regular PostgreSQL database for production or deploy workflows.

## Production

The app ships with a Dockerfile for VPS/Coolify deploys.

Required production environment variables:

```bash
DATABASE_URL="postgresql://..."
DIRECT_DATABASE_URL="postgresql://..."
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
GITHUB_CLIENT_ID="..."
GITHUB_CLIENT_SECRET="..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

`DATABASE_URL` is used by Prisma migrations. `DIRECT_DATABASE_URL` is used by the app through `@prisma/adapter-pg`. In a simple Coolify Postgres setup, both can use the same internal PostgreSQL connection string.

OAuth callback URLs:

```text
https://your-domain.com/api/auth/callback/github
https://your-domain.com/api/auth/callback/google
```

The container starts with:

```bash
npx prisma migrate deploy && npm run start
```

For a direct VPS deploy, use `compose.prod.yml` with a private `.env.production` file on the server.
