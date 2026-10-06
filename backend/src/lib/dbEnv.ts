// Database env resolution shared by the runtime (lib/prisma.ts) and the Vercel build script.
// Vercel's Neon/Postgres integrations expose different names depending on version, so accept
// the common aliases and normalise them to what prisma/schema.prisma reads.
const POOLED = ['DATABASE_URL', 'POSTGRES_PRISMA_URL', 'POSTGRES_URL']
const DIRECT = ['DATABASE_URL_UNPOOLED', 'POSTGRES_URL_NON_POOLING', 'DIRECT_URL']

function first(names: string[]): string | undefined {
  for (const n of names) {
    const v = process.env[n]
    if (v && v.trim()) return v.trim()
  }
  return undefined
}

/** Fills DATABASE_URL / DATABASE_URL_UNPOOLED from aliases. Returns false when no database is configured. */
export function resolveDatabaseEnv(): boolean {
  const pooled = first(POOLED)
  const direct = first(DIRECT) ?? pooled
  if (!pooled) return false
  process.env.DATABASE_URL = pooled
  process.env.DATABASE_URL_UNPOOLED = direct
  return true
}
