// User Database Utilities
import prisma from './client.js'
import { authUtils } from '../utils/auth.js'

export const userUtils = {
  // Create new user
  async createUser(userData) {
    try {
      const { email, password, displayName } = userData
      
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })
      
      if (existingUser) {
        throw new Error('User with this email already exists')
      }

      // Hash password
      const passwordHash = await authUtils.hashPassword(password)

      // Create user
      const user = await prisma.user.create({
        data: {
          email,
          passwordHash,
          displayName,
          isUcfVerified: email.endsWith('@ucf.edu') || email.endsWith('@knights.ucf.edu')
        },
        select: {
          id: true,
          email: true,
          displayName: true,
          isUcfVerified: true,
          createdAt: true
        }
      })

      return user
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  },

  // Authenticate user
  async authenticateUser(email, password) {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        throw new Error('Invalid email or password')
      }

      const isValidPassword = await authUtils.verifyPassword(password, user.passwordHash)
      
      if (!isValidPassword) {
        throw new Error('Invalid email or password')
      }

      return {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        isUcfVerified: user.isUcfVerified
      }
    } catch (error) {
      console.error('Error authenticating user:', error)
      throw error
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      return await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          email: true,
          displayName: true,
          isUcfVerified: true,
          createdAt: true,
          _count: {
            select: {
              listings: true,
              posts: true,
              services: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error fetching user:', error)
      throw error
    }
  },

  // Update user profile
  async updateUser(id, updateData) {
    try {
      return await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
        select: {
          id: true,
          email: true,
          displayName: true,
          isUcfVerified: true,
          updatedAt: true
        }
      })
    } catch (error) {
      console.error('Error updating user:', error)
      throw error
    }
  },

  // Get user's listings
  async getUserListings(userId) {
    try {
      return await prisma.listing.findMany({
        where: { authorId: parseInt(userId) },
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
    } catch (error) {
      console.error('Error fetching user listings:', error)
      throw error
    }
  }
}

export default userUtils
