import { PrismaClient } from '@prisma/client'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import path from 'path'
import fs from 'fs'

const prisma = new PrismaClient()
const app = express()
const PORT = 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static('public'))
app.use(express.static('frontend'))

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'frontend/uploads'
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed'), false)
    }
  }
})

// Routes

// Get all marketplace items
app.get('/api/items', async (req, res) => {
  try {
    const items = await prisma.listing.findMany({
      include: {
        author: {
          select: {
            displayName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    res.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    res.status(500).json({ error: 'Failed to fetch items' })
  }
})

// Create new marketplace item
app.post('/api/items', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, condition } = req.body
    const imagePath = req.file ? `uploads/${req.file.filename}` : null

    // For demo purposes, we'll use a default user ID
    // In a real app, you'd get this from authentication
    const defaultUserId = 1

    const item = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        imagePath,
        authorId: defaultUserId,
      },
      include: {
        author: {
          select: {
            displayName: true,
            email: true
          }
        }
      }
    })

    res.json({ ...item, imagePath })
  } catch (error) {
    console.error('Error creating item:', error)
    res.status(500).json({ error: 'Failed to create item' })
  }
})

// Get single item
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await prisma.listing.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: {
          select: {
            displayName: true,
            email: true
          }
        }
      }
    })
    
    if (!item) {
      return res.status(404).json({ error: 'Item not found' })
    }
    
    res.json(item)
  } catch (error) {
    console.error('Error fetching item:', error)
    res.status(500).json({ error: 'Failed to fetch item' })
  }
})

// Update item
app.put('/api/items/:id', async (req, res) => {
  try {
    const { title, description, price, category, isActive } = req.body
    
    const item = await prisma.listing.update({
      where: { id: parseInt(req.params.id) },
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        isActive: isActive !== undefined ? isActive : true
      },
      include: {
        author: {
          select: {
            displayName: true,
            email: true
          }
        }
      }
    })
    
    res.json(item)
  } catch (error) {
    console.error('Error updating item:', error)
    res.status(500).json({ error: 'Failed to update item' })
  }
})

// Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    await prisma.listing.delete({
      where: { id: parseInt(req.params.id) }
    })
    
    res.json({ message: 'Item deleted successfully' })
  } catch (error) {
    console.error('Error deleting item:', error)
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

// Clear all data
app.post('/api/clear', async (req, res) => {
  try {
    // Delete all listings, posts, and services
    await prisma.listing.deleteMany()
    await prisma.post.deleteMany()
    await prisma.service.deleteMany()
    
    // Keep the default user for new listings
    console.log('🗑️ Database cleared successfully')
    res.json({ message: 'Database cleared successfully' })
  } catch (error) {
    console.error('Error clearing database:', error)
    res.status(500).json({ error: 'Failed to clear database' })
  }
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'KnightHaven API is running' })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KnightHaven API Server running on http://localhost:${PORT}`)
  console.log(`📊 Database: Connected to SQLite via Prisma`)
  console.log(`🛍️ Marketplace API: http://localhost:${PORT}/api/items`)
})

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔄 Shutting down API server...')
  await prisma.$disconnect()
  process.exit(0)
})
