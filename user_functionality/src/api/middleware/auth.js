// Authentication Middleware
import { authUtils } from '../../utils/auth.js'
import { userUtils } from '../../database/userUtils.js'

export const authMiddleware = {
  // Verify JWT token
  async verifyToken(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return res.status(401).json({ error: 'No token provided' })
      }

      const decoded = authUtils.verifyToken(token)
      
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      // Get fresh user data
      const user = await userUtils.getUserById(decoded.id)
      
      if (!user) {
        return res.status(401).json({ error: 'User not found' })
      }

      req.user = user
      next()
    } catch (error) {
      console.error('Auth middleware error:', error)
      res.status(401).json({ error: 'Authentication failed' })
    }
  },

  // Optional authentication (doesn't fail if no token)
  async optionalAuth(req, res, next) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      
      if (token) {
        const decoded = authUtils.verifyToken(token)
        if (decoded) {
          const user = await userUtils.getUserById(decoded.id)
          if (user) {
            req.user = user
          }
        }
      }
      
      next()
    } catch (error) {
      // Continue without authentication
      next()
    }
  }
}

export default authMiddleware
