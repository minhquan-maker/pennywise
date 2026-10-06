// Emit dist/<route>/index.html (and 404.html) copies of the SPA shell so deep links and refreshes
// work on any static host — including Vercel Services, without relying on a rewrite to index.html.
import { copyFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'

const ROUTES = ['about', 'login', 'register', 'dashboard', 'transactions', 'budget', 'analytics', 'settings']
const dist = new URL('../dist/', import.meta.url).pathname
const shell = join(dist, 'index.html')

for (const route of ROUTES) {
  mkdirSync(join(dist, route), { recursive: true })
  copyFileSync(shell, join(dist, route, 'index.html'))
}
copyFileSync(shell, join(dist, '404.html'))
console.log(`spa-routes: wrote ${ROUTES.length} route shells + 404.html`)
