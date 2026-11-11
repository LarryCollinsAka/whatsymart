const { execSync } = require('node:child_process')

// Prisma Client generation does not connect to the database. Use a harmless
// local placeholder only when the build environment has no DATABASE_URL.
// Runtime database access still requires a real secret supplied by the host.
const env = { ...process.env }
if (!env.DATABASE_URL) {
  env.DATABASE_URL = 'postgresql://placeholder:placeholder@127.0.0.1:5432/whatsymart?schema=public'
}

console.log('Generating Prisma Client...')
execSync('npx prisma generate', { stdio: 'inherit', env })
console.log('Prisma Client generated successfully.')
