import jwt from 'jsonwebtoken'

export default function policeAuth(req, res, next) {
  const header = req.headers.authorization
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' })
  }
  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (!decoded.district) return res.status(403).json({ message: 'Not a police account' })
    req.officer = decoded
    next()
  } catch {
    res.status(401).json({ message: 'Invalid token' })
  }
}