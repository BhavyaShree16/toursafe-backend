import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Police from '../models/Police.js'

export const policeRegister = async (req, res) => {
  try {
    const { name, email, password, district, stationName } = req.body
    const exists = await Police.findOne({ email })
    if (exists) return res.status(400).json({ message: 'Email already registered' })

    const hashed = await bcrypt.hash(password, 10)
    const officer = await Police.create({ name, email, password: hashed, district, stationName })

    const token = jwt.sign(
      { officerId: officer._id, name: officer.name, district: officer.district, stationName: officer.stationName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.status(201).json({
      token,
      officer: { id: officer._id, name: officer.name, district: officer.district, stationName: officer.stationName }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const policeLogin = async (req, res) => {
  try {
    const { email, password } = req.body
    const officer = await Police.findOne({ email })
    if (!officer) return res.status(400).json({ message: 'Invalid credentials' })

    const match = await bcrypt.compare(password, officer.password)
    if (!match) return res.status(400).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { officerId: officer._id, name: officer.name, district: officer.district, stationName: officer.stationName },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )
    res.json({
      token,
      officer: { id: officer._id, name: officer.name, district: officer.district, stationName: officer.stationName }
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}