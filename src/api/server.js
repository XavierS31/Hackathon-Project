// KnightHaven API Server
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from '../config/config.js'
import { errorHandler } from './middleware/errorHandler.js'
import itemsRouter from './routes/items.js'
import adminRouter from './routes/admin.js'
import authRouter from './routes/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Middleware
app.use(cors(config.api.cors))
app.use(express.json())
app.use(express.static('public'))
app.use(express.static('frontend'))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/items', itemsRouter)
app.use('/api', adminRouter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'KnightHaven API is running',
    timestamp: new Date().toISOString()
  })
})

// Error handling
app.use(errorHandler)

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

export default app

