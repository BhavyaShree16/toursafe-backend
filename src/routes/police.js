import express from 'express'
import policeAuth from '../middleware/policeAuth.js'
import { policeRegister, policeLogin } from '../controllers/policeAuthController.js'
import { getAllTourists, getAllStats, raiseAlert, resolveAlert, getAlerts } from '../controllers/policeController.js'
import Tourist from '../models/Tourist.js'
import { getAllTourists, getAllStats, raiseAlert, resolveAlert, getAlerts } from '../controllers/policeController.js'

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
export default router