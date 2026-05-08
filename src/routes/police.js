import express from 'express'
import policeAuth from '../middleware/policeAuth.js'
import { policeRegister, policeLogin } from '../controllers/policeAuthController.js'
import { getAllTourists, getAllStats, raiseAlert, resolveAlert, getAlerts } from '../controllers/policeController.js'
import Tourist from '../models/Tourist.js'

const router = express.Router()

router.post('/register', policeRegister)
router.post('/login', policeLogin)
router.post('/efir/:id', policeAuth, generateEFIR)


router.get('/tourists', policeAuth, getAllTourists)
router.get('/stats', policeAuth, getAllStats)
router.get('/alerts', policeAuth, getAlerts)
router.patch('/tourists/:id/alert', policeAuth, raiseAlert)
router.patch('/tourists/:id/resolve', policeAuth, resolveAlert)
router.get('/tourists/:id/status', async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id)
    if (!tourist) return res.status(404).json({ message: 'Not found' })
    res.json({ status: tourist.status, touristId: tourist.touristId })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})
export const generateEFIR = async (req, res) => {
  try {
    const tourist = await Tourist.findById(req.params.id)
      .populate('hotelId', 'name city')
    
    if (!tourist) return res.status(404).json({ message: 'Tourist not found' })

    const AI_URL = process.env.AI_SERVICE_URL
    if (!AI_URL) return res.status(500).json({ message: 'AI service not configured' })

    const response = await fetch(`${AI_URL}/agent/efir`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      })
    })

    const data = await response.json()
    res.json({ efir: data.efir })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export default router