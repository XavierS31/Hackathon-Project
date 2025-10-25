// KnightHaven Configuration
export const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || 'localhost'
  },
  
  // Frontend Configuration
  frontend: {
    port: process.env.FRONTEND_PORT || 8080,
    host: process.env.FRONTEND_HOST || 'localhost'
  },
  
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || 'file:./dev.db'
  },
  
  // Upload Configuration
  uploads: {
    destination: 'frontend/uploads',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  
  // API Configuration
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  }
}

export default config

