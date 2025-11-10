import fp from 'fastify-plugin'
import { PrismaClient } from '@prisma/client'

export interface PrismaPluginOptions {
  // Specify Prisma plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<PrismaPluginOptions>(async (fastify, opts) => {
  const prisma = new PrismaClient()

  // Make Prisma available throughout the application
  fastify.decorate('prisma', prisma)

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    await prisma.$disconnect()
  })
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    prisma: PrismaClient
  }
}

