// Database Utility Functions
import prisma from './client.js'

export const dbUtils = {
  // Clear all data
  async clearAll() {
    try {
      await prisma.listing.deleteMany()
      await prisma.post.deleteMany()
      await prisma.service.deleteMany()
      console.log('🗑️ Database cleared successfully')
      return { success: true, message: 'Database cleared successfully' }
    } catch (error) {
      console.error('Error clearing database:', error)
      throw new Error('Failed to clear database')
    }
  },

  // Get all items with author info
  async getAllItems() {
    try {
      return await prisma.listing.findMany({
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
      console.error('Error fetching items:', error)
      throw new Error('Failed to fetch items')
    }
  },

  // Create new item
  async createItem(itemData) {
    try {
      return await prisma.listing.create({
        data: {
          title: itemData.title,
          description: itemData.description,
          price: parseFloat(itemData.price),
          category: itemData.category,
          imagePath: itemData.imagePath,
          authorId: itemData.authorId,
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
    } catch (error) {
      console.error('Error creating item:', error)
      throw new Error('Failed to create item')
    }
  },

  // Update item
  async updateItem(id, updateData) {
    try {
      return await prisma.listing.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          author: {
            select: {
              displayName: true,
              email: true
            }
          }
        }
      })
    } catch (error) {
      console.error('Error updating item:', error)
      throw new Error('Failed to update item')
    }
  },

  // Delete item
  async deleteItem(id) {
    try {
      await prisma.listing.delete({
        where: { id: parseInt(id) }
      })
      return { message: 'Item deleted successfully' }
    } catch (error) {
      console.error('Error deleting item:', error)
      throw new Error('Failed to delete item')
    }
  }
}

export default dbUtils

