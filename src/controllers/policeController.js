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