import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 KnightHaven Database Connection Test')
  console.log('=====================================')
  
  try {
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully!')
    
    // Get user count
    const userCount = await prisma.user.count()
    console.log(`📊 Total users: ${userCount}`)
    
    // Get post count
    const postCount = await prisma.post.count()
    console.log(`📝 Total posts: ${postCount}`)
    
    // Get listing count
    const listingCount = await prisma.listing.count()
    console.log(`🛍️ Total listings: ${listingCount}`)
    
    // Get service count
    const serviceCount = await prisma.service.count()
    console.log(`🔧 Total services: ${serviceCount}`)
    
    console.log('\n🎉 Prisma is properly set up and working!')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
  } finally {
    await prisma.$disconnect()
    console.log('🔌 Database connection closed')
  }
}

main()
