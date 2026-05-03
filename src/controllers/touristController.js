import Tourist from '../models/Tourist.js'
import { sendWhatsApp } from '../services/whatsapp.js'

const generateId = () => {
  const num = Math.floor(1000 + Math.random() * 9000)
  return `TSF-${num}`
}

export const registerTourist = async (req, res) => {
  try {
    const touristId = generateId()
    const tourist = await Tourist.create({
      ...req.body,
      hotelId: req.hotel.hotelId,
      touristId,
    })

    // Send WhatsApp welcome message
    const message = `🌿 *Welcome to Northeast India!*

Hello ${tourist.name}, you're registered as a tourist.

*Your Tourist ID:* ${tourist.touristId}
*Destinations:* ${tourist.place}
*Check-in:* ${tourist.checkIn}
*Check-out:* ${tourist.checkOut}

Save this number for emergencies.
Reply *SOS* if you need immediate help.
Reply *INFO* for today's safety tips.

Stay safe and enjoy your trip! 🏔️`

    // Fire and forget — don't block the response
    sendWhatsApp(tourist.phone, message).catch(console.error)

    res.status(201).json(tourist)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getTourists = async (req, res) => {
  try {
    const tourists = await Tourist.find({ hotelId: req.hotel.hotelId })
      .sort({ createdAt: -1 })
    res.json(tourists)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getDashboardStats = async (req, res) => {
  try {
    const hotelId = req.hotel.hotelId
    const all = await Tourist.find({ hotelId })
    const active = all.filter(t => t.status === 'active').length
    const departed = all.filter(t => t.status === 'departed').length
    const alerts = all.filter(t => t.status === 'alert').length
    const recent = all.slice(0, 5)
    res.json({ total: all.length, active, departed, alerts, recent })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}