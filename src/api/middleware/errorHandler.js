// Error Handling Middleware
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ 
      error: 'File too large. Maximum size is 5MB.' 
    })
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ 
      error: 'Unexpected field name' 
    })
  }

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({ 
      error: 'Unique constraint violation' 
    })
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ 
      error: 'Record not found' 
    })
  }

  // Default error
  res.status(500).json({ 
    error: err.message || 'Internal server error' 
  })
}

export default errorHandler

