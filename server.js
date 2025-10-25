import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'KnightHaven API is running!',
    timestamp: new Date().toISOString()
  });
});

// Database stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const listingCount = await prisma.listing.count();
    const serviceCount = await prisma.service.count();
    
    res.json({
      users: userCount,
      posts: postCount,
      listings: listingCount,
      services: serviceCount
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Users endpoints
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        isUcfVerified: true,
        createdAt: true
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, passwordHash, displayName, isUcfVerified } = req.body;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
        isUcfVerified: isUcfVerified || false
      }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Posts endpoints
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            isUcfVerified: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

app.post('/api/posts', async (req, res) => {
  try {
    const { title, content, authorId } = req.body;
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId: parseInt(authorId)
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            isUcfVerified: true
          }
        }
      }
    });
    res.json(post);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Listings endpoints
app.get('/api/listings', async (req, res) => {
  try {
    const listings = await prisma.listing.findMany({
      where: { isActive: true },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            isUcfVerified: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(listings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
});

app.post('/api/listings', async (req, res) => {
  try {
    const { title, description, price, category, authorId } = req.body;
    const listing = await prisma.listing.create({
      data: {
        title,
        description,
        price: parseFloat(price),
        category,
        authorId: parseInt(authorId)
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            isUcfVerified: true
          }
        }
      }
    });
    res.json(listing);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create listing' });
  }
});

// Services endpoints
app.get('/api/services', async (req, res) => {
  try {
    const services = await prisma.service.findMany({
      where: { isActive: true },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            isUcfVerified: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

app.post('/api/services', async (req, res) => {
  try {
    const { title, description, category, authorId } = req.body;
    const service = await prisma.service.create({
      data: {
        title,
        description,
        category,
        authorId: parseInt(authorId)
      },
      include: {
        author: {
          select: {
            id: true,
            displayName: true,
            isUcfVerified: true
          }
        }
      }
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KnightHaven API Server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Stats: http://localhost:${PORT}/api/stats`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🔌 Closing database connection...');
  await prisma.$disconnect();
  process.exit(0);
});
