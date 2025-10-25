import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Yelp API key
const YELP_API_KEY = "HdrTZK8pCbDhmD5OTilm9wGBE3XwucLoQ3Qt7NOX__3fYYrG4CttZ9psfNc8m4kfNG32-V0jd1cnLG19fd0hoxqipBoAyFumq8_aeSW2tQGaUd_OolJhxkRa7lb8aHYx";

// Google Maps API key
const GOOGLE_MAPS_API_KEY = "AIzaSyCnaJrYTNJF3bYR8ECfBxhcqgCD4JYVRl8";

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

// Places endpoint - fetch stored Yelp data
app.get('/api/places', async (req, res) => {
  try {
    const places = await prisma.place.findMany({
      orderBy: { rating: 'desc' }
    });
    res.json(places);
  } catch (error) {
    console.error('Error fetching places:', error);
    res.status(500).json({ error: 'Failed to fetch places' });
  }
});

// Google Maps API key endpoint
app.get('/api/maps-key', (req, res) => {
  res.json({ apiKey: GOOGLE_MAPS_API_KEY });
});

// Yelp API route
app.get("/api/yelp/:city", async (req, res) => {
  const { city } = req.params;
  console.log(`🔍 Fetching Yelp data for city: ${city}`);

  try {
    // Fetch data from Yelp API
    const yelpUrl = `https://api.yelp.com/v3/businesses/search?term=restaurants&location=${encodeURIComponent(city)}&limit=20`;
    console.log(`📡 Yelp API URL: ${yelpUrl}`);
    
    const resp = await fetch(yelpUrl, {
      headers: {
        Authorization: `Bearer ${YELP_API_KEY}`,
      },
    });
    
    console.log(`📊 Yelp API Response Status: ${resp.status}`);
    const data = await resp.json();
    console.log(`📋 Yelp API Response:`, JSON.stringify(data, null, 2));

    if (!data.businesses) {
      console.log(`❌ No businesses found in Yelp response`);
      return res.status(400).json({ error: "Invalid response from Yelp" });
    }

    console.log(`🏢 Found ${data.businesses.length} businesses from Yelp`);

    let storedCount = 0;
    // Store each business in SQLite through Prisma
    for (const b of data.businesses) {
      try {
        console.log(`💾 Storing business: ${b.name} (ID: ${b.id})`);
        await prisma.place.upsert({
          where: { yelpId: b.id },
          update: {
            name: b.name,
            rating: b.rating,
            reviewCount: b.review_count,
            address: b.location?.address1 || "",
            city: b.location?.city || "",
            latitude: b.coordinates?.latitude,
            longitude: b.coordinates?.longitude,
          },
          create: {
            yelpId: b.id,
            name: b.name,
            rating: b.rating,
            reviewCount: b.review_count,
            address: b.location?.address1 || "",
            city: b.location?.city || "",
            latitude: b.coordinates?.latitude,
            longitude: b.coordinates?.longitude,
          },
        });
        storedCount++;
        console.log(`✅ Successfully stored: ${b.name}`);
      } catch (dbError) {
        console.error(`❌ Error storing business ${b.name}:`, dbError);
      }
    }

    console.log(`🎉 Total stored: ${storedCount} out of ${data.businesses.length} businesses`);
    res.json({ stored: storedCount });
  } catch (err) {
    console.error(`💥 Yelp API Error:`, err);
    res.status(500).json({ error: "Server error" });
  }
});

//END OF YELP API ROUTE







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
