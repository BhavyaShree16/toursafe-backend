import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Hotel from '../models/Hotel.js'

export const register = async (req, res) => {
  try {
    const { name, email, password, city } = req.body
    const exists = await Hotel.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const hotel = await Hotel.create({ name, email, password: hashed, city })

    const token = jwt.sign(
      { hotelId: hotel._id, name: hotel.name, email: hotel.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.status(201).json({ token, hotel: { id: hotel._id, name: hotel.name, email: hotel.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body
    const hotel = await Hotel.findOne({ email })
    if (!hotel) return res.status(400).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, hotel.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })
    
    if (!hotel.isApproved) {
      return res.status(403).json({ message: 'Account pending approval. Contact the tourism department.' })
    }
    
    const token = jwt.sign(
      { hotelId: hotel._id, name: hotel.name, email: hotel.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({ token, hotel: { id: hotel._id, name: hotel.name, email: hotel.email } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}