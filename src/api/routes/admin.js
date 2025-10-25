// Admin API Routes
import express from 'express'
import { dbUtils } from '../../database/utils.js'

const router = express.Router()

// POST /api/clear - Clear all data
router.post('/clear', async (req, res) => {
  try {
    const result = await dbUtils.clearAll()
    res.json(result)
  } catch (error) {
    console.error('Error clearing database:', error)
    res.status(500).json({ error: 'Failed to clear database' })
  }
})

export default router

