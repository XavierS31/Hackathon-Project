// KnightHaven Main Entry Point
import app from './api/server.js'
import { config } from './config/config.js'

const PORT = config.server.port
const HOST = config.server.host

// Start server
app.listen(PORT, HOST, () => {
  console.log(`🚀 KnightHaven API Server running on http://${HOST}:${PORT}`)
  console.log(`📊 Database: Connected to SQLite via Prisma`)
  console.log(`🛍️ Marketplace API: http://${HOST}:${PORT}/api/items`)
  console.log(`🏥 Health Check: http://${HOST}:${PORT}/api/health`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully')
  process.exit(0)
})

