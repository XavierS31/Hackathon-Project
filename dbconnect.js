import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Create a user
  const user = await prisma.user.create({
    data: {
      name: 'Xavier Soto Baron',
      email: 'xa168750@ucf.edu',
      posts: {
        create: { title: 'My first post!' },
      },
    },
  })
  console.log('Created user:', user)

  // Fetch all users
  const users = await prisma.user.findMany({ include: { posts: true } })
  console.log('All users:', users)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
  })
