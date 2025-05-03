import jwt from 'jsonwebtoken'

export const adminAuth = (req, res, next) => {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '')

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' })
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret')
    
    // Check if user is an admin
    if (decoded.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied: Admin privileges required' })
    }
    
    req.user = decoded
    next()
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' })
  }
}