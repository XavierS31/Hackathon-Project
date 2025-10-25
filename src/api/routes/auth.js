// Authentication Routes
import express from 'express'
import { authUtils } from '../../utils/auth.js'
import { userUtils } from '../../database/userUtils.js'

const router = express.Router()

// POST /api/auth/register - Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, displayName } = req.body

    // Validation
    if (!email || !password || !displayName) {
      return res.status(400).json({ error: 'Email, password, and display name are required' })
    }

    if (!authUtils.isValidEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    if (!authUtils.isValidPassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters with uppercase, lowercase, and number' 
      })
    }

    if (!authUtils.isValidUsername(displayName)) {
      return res.status(400).json({ 
        error: 'Display name must be 3-20 characters (letters, numbers, underscores only)' 
      })
    }

    // Create user
    const user = await userUtils.createUser({ email, password, displayName })
    
    // Generate token
    const token = authUtils.generateToken(user)

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isUcfVerified: user.isUcfVerified
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(400).json({ error: error.message || 'Registration failed' })
  }
})

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    // Authenticate user
    const user = await userUtils.authenticateUser(email, password)
    
    // Generate token
    const token = authUtils.generateToken(user)

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isUcfVerified: user.isUcfVerified
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(401).json({ error: error.message || 'Login failed' })
  }
})

// GET /api/auth/me - Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const decoded = authUtils.verifyToken(token)
    
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const user = await userUtils.getUserById(decoded.id)
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to get user' })
  }
})

export default router
