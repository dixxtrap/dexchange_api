import path from 'node:path'
import type { PrismaConfig } from 'prisma'
process.loadEnvFile()
export default {
     schema: path.join('prisma'),

} satisfies PrismaConfig