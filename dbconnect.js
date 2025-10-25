import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      email: 'xa168750@ucf.edu',
      passwordHash: 'hashed_password_here', // In real app, hash the password
      displayName: 'Xavier Soto Baron',
      isUcfVerified: true,
      posts: {
        create: { 
          title: 'My first post!',
          content: 'Welcome to KnightHaven! This is my first post on the platform.'
        },
      },
    },
  })
  console.log('Created user:', user)

  // Create a sample listing
  const listing = await prisma.listing.create({
    data: {
      title: 'Textbook for Sale',
      description: 'Calculus textbook in great condition',
      price: 50.00,
      category: 'Books',
      authorId: user.id,
    },
  })
  console.log('Created listing:', listing)

  // Create a sample service
  const service = await prisma.service.create({
    data: {
      title: 'Math Tutoring',
      description: 'I can help with calculus and algebra',
      category: 'Education',
      authorId: user.id,
    },
  })
  console.log('Created service:', service)

  // Fetch all users with their relations
  const users = await prisma.user.findMany({ 
    include: { 
      posts: true,
      listings: true,
      services: true
    } 
  })
  console.log('All users with relations:', users)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })
