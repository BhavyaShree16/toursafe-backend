import Tourist from '../models/Tourist.js'
import { io } from '../../server.js'

// All queries now filter by officer's district from JWT
export const getAllTourists = async (req, res) => {
  try {
    const tourists = await Tourist.find({ district: req.officer.district })
      .populate('hotelId', 'name city')
      .sort({ createdAt: -1 })
    res.json(tourists)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getAllStats = async (req, res) => {
  try {
    const all = await Tourist.find({ district: req.officer.district })
    res.json({
      total: all.length,
      active: all.filter(t => t.status === 'active').length,
      alert: all.filter(t => t.status === 'alert').length,
      departed: all.filter(t => t.status === 'departed').length,
      district: req.officer.district,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getAlerts = async (req, res) => {
  try {
    const alerts = await Tourist.find({
      district: req.officer.district,
      status: 'alert'
    })
      .populate('hotelId', 'name city')
      .sort({ updatedAt: -1 })
    res.json(alerts)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const raiseAlert = async (req, res) => {
  try {
    const tourist = await Tourist.findByIdAndUpdate(
      req.params.id,
      { status: 'alert' },
      { new: true }
    ).populate('hotelId', 'name city')

    io.emit('sos:new', tourist)
    res.json(tourist)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const resolveAlert = async (req, res) => {
  try {
    const tourist = await Tourist.findByIdAndUpdate(
      req.params.id,
      { status: 'active' },
      { new: true }
    ).populate('hotelId', 'name city')

    io.emit('alert:resolved', { id: req.params.id })
    res.json(tourist)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
export const generateEFIR = async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id)
      .populate('hotelId', 'name city')

    if (!tourist) {
      return res.status(404).json({ message: 'Tourist not found' })
    }

    const AI_URL = process.env.AI_SERVICE_URL

    if (!AI_URL) {
      return res.status(500).json({ message: 'AI service not configured' })
    }

    const response = await fetch(`${AI_URL}/agent/efir`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        touristId: tourist.touristId,
        name: tourist.name,
        nationality: tourist.nationality,
        idNumber: tourist.idNumber,
        phone: tourist.phone,
        place: tourist.place,
        district: tourist.district || tourist.place,
        hotelName: tourist.hotelId?.name || 'Unknown Hotel',
        emergencyName: tourist.emergencyName,
        emergencyPhone: tourist.emergencyPhone,
        checkIn: tourist.checkIn,
        checkOut: tourist.checkOut,
      }),
    })

    const data = await response.json()

    res.json({ efir: data.efir })

  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}