import express from 'express'
import auth from '../middleware/auth.js'
import { registerTourist, getTourists, getDashboardStats } from '../controllers/touristController.js'

const router = express.Router()
router.post('/register', auth, registerTourist)
router.get('/', auth, getTourists)
router.get('/stats', auth, getDashboardStats)
export default router