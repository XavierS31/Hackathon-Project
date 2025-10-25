// Items API Routes
import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { config } from '../../config/config.js'
import { dbUtils } from '../../database/utils.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = config.uploads.destination
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
  storage,
  limits: { fileSize: config.uploads.maxFileSize },
  fileFilter: (req, file, cb) => {
    if (config.uploads.allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'), false)
    }
  }
})

// GET /api/items - Get all items
router.get('/', async (req, res) => {
  try {
    const items = await dbUtils.getAllItems()
    res.json(items)
  } catch (error) {
    console.error('Error fetching items:', error)
    res.status(500).json({ error: 'Failed to fetch items' })
  }
})

// POST /api/items - Create new item (requires authentication)
router.post('/', authMiddleware.verifyToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, condition } = req.body
    const imagePath = req.file ? `uploads/${req.file.filename}` : null

    const item = await dbUtils.createItem({
      title,
      description,
      price,
      category,
      imagePath,
      authorId: req.user.id // Use authenticated user's ID
    })

    res.json({ ...item, imagePath })
  } catch (error) {
    console.error('Error creating item:', error)
    res.status(500).json({ error: 'Failed to create item' })
  }
})

// PUT /api/items/:id - Update item
router.put('/:id', async (req, res) => {
  try {
    const { title, description, price, category } = req.body
    const updateData = { title, description, price: parseFloat(price), category }
    
    const item = await dbUtils.updateItem(req.params.id, updateData)
    res.json(item)
  } catch (error) {
    console.error('Error updating item:', error)
    res.status(500).json({ error: 'Failed to update item' })
  }
})

// DELETE /api/items/:id - Delete item
router.delete('/:id', async (req, res) => {
  try {
    const result = await dbUtils.deleteItem(req.params.id)
    res.json(result)
  } catch (error) {
    console.error('Error deleting item:', error)
    res.status(500).json({ error: 'Failed to delete item' })
  }
})

export default router

