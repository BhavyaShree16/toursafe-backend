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

    // 1. Send immediate welcome WhatsApp
    
    const welcomeMessage = `🌿 Welcome to ${tourist.place}, ${tourist.name}!

Your Tourist ID: ${tourist.touristId}
Destination: ${tourist.place}
Check-in: ${tourist.checkIn}
Check-out: ${tourist.checkOut}

Save this number for emergencies.
Reply SOS if you need immediate help.
Reply INFO for your trip details.
Reply HELP for all commands.

Stay safe and enjoy your trip! 🏔️`

    sendWhatsApp(tourist.phone, welcomeMessage).catch(console.error)

    // 2. Trigger n8n onboarding workflow (AI briefing)
    const N8N_WEBHOOK = process.env.N8N_WEBHOOK_ONBOARDING
    if (N8N_WEBHOOK) {
      console.log('Triggering n8n onboarding webhook:', N8N_WEBHOOK)
      fetch(N8N_WEBHOOK, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: tourist.touristId,
          name: tourist.name,
          phone: tourist.phone,
          place: tourist.place,
          checkIn: tourist.checkIn,
          checkOut: tourist.checkOut,
          purpose: tourist.purpose || 'leisure',
          emergencyName: tourist.emergencyName,
          emergencyPhone: tourist.emergencyPhone,
          nationality: tourist.nationality,
          idNumber: tourist.idNumber,
          hotelName: req.hotel.name || 'Hotel',
        })
      })
      .then(r => {
        console.log('n8n webhook response status:', r.status)
        return r.text()
      })
      .then(text => console.log('n8n response:', text))
      .catch(err => console.error('n8n webhook error:', err.message))
    } else {
      console.log('N8N_WEBHOOK_ONBOARDING not set — skipping n8n')
    }

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