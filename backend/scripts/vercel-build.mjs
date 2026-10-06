// Vercel build step for the backend service: generate the Prisma client and apply migrations.
// If no database is connected yet, skip migrations with a clear warning instead of failing the
// whole deploy — the API then answers 503 "Database not configured" until one is connected.
import { execSync } from 'node:child_process'

const pick = (names) => names.map((n) => process.env[n]).find((v) => v && v.trim())
const pooled = pick(['DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL'])
const direct = pick(['DATABASE_URL_UNPOOLED', 'POSTGRES_URL_NON_POOLING', 'DIRECT_URL']) ?? pooled
const run = (cmd, env) => execSync(cmd, { stdio: 'inherit', env: { ...process.env, ...env } })

run('npx prisma generate')

if (!pooled) {
  console.warn('\n⚠️  No database configured (DATABASE_URL / POSTGRES_URL not set).')
  console.warn('   Skipping migrations. Connect a Neon/Postgres database in Vercel → Storage, then redeploy.\n')
  process.exit(0)
}

run('npx prisma migrate deploy', { DATABASE_URL: pooled, DATABASE_URL_UNPOOLED: direct })
