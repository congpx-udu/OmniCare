import { app } from './app.js'
import { connectDB, disconnectDB } from './config/db.js'
import { env } from './config/env.js'
import { logger } from './config/logger.js'

async function main() {
  await connectDB()
  const server = app.listen(env.PORT, () => {
    logger.info(`API listening on http://localhost:${env.PORT}/api`)
  })

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down`)
    server.close(async () => {
      await disconnectDB()
      process.exit(0)
    })
  }
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

main().catch((err) => {
  logger.error(err, 'Failed to start server')
  process.exit(1)
})
