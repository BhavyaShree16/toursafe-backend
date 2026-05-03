import Tourist from '../models/Tourist.js'
import { sendWhatsApp } from '../services/whatsapp.js'
import { io } from '../../server.js'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
dotenv.config()

export const handleIncoming = async (req, res) => {
  const body = req.body.Body?.trim().toUpperCase()
  const from = req.body.From?.replace('whatsapp:', '')

  console.log(`Incoming WhatsApp from ${from}: ${body}`)

  const tourist = await Tourist.findOne({ phone: from })
    .populate('hotelId', 'name city')

  if (!tourist) {
    await sendWhatsApp(from,
      `You are not registered in our system. Please check with your hotel.`
    )
    return res.sendStatus(200)
  }

  if (body === 'SOS') {

    // 1. Update status in MongoDB
    await Tourist.findByIdAndUpdate(tourist._id, { status: 'alert' })

    // 2. Emit to police dashboard instantly
    io.emit('sos:new', {
      _id: tourist._id,
      touristId: tourist.touristId,
      name: tourist.name,
      phone: tourist.phone,
      place: tourist.place,
      status: 'alert',
      hotelId: tourist.hotelId,
      emergencyName: tourist.emergencyName,
      emergencyPhone: tourist.emergencyPhone,
    })

    // 3. Reply to tourist immediately
    await sendWhatsApp(from,
      `🚨 SOS Received, ${tourist.name}.

Help is on the way. Police have been notified.

Stay where you are if it is safe.
Your Tourist ID: ${tourist.touristId}

Reply INFO for your trip details.`
    )

    // 4. Trigger n8n SOS workflow (fire and forget)
    const N8N_SOS = process.env.N8N_WEBHOOK_SOS
    if (N8N_SOS) {
      fetch(N8N_SOS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          touristId: tourist.touristId,
          mongoId: tourist._id.toString(),
          name: tourist.name,
          phone: from,
          place: tourist.place,
          hotelName: tourist.hotelId?.name || 'Unknown',
          emergencyName: tourist.emergencyName,
          emergencyPhone: tourist.emergencyPhone,
          checkIn: tourist.checkIn,
          checkOut: tourist.checkOut,
          nationality: tourist.nationality,
          idNumber: tourist.idNumber,
        })
      }).catch(console.error)
    }

  } else if (body === 'INFO') {
    await sendWhatsApp(from,
      `ℹ️ Your Trip Info

Name: ${tourist.name}
ID: ${tourist.touristId}
Destination: ${tourist.place}
Check-in: ${tourist.checkIn}
Check-out: ${tourist.checkOut}
Purpose: ${tourist.purpose}

Emergency contact: ${tourist.emergencyName} (${tourist.emergencyPhone})

Reply SOS anytime if you need help.`
    )

  } else if (body === 'HELP') {
    await sendWhatsApp(from,
      `Available Commands:

SOS - Emergency alert to police
INFO - Your trip details
HELP - This menu

Your ID: ${tourist.touristId}`
    )

  } else {
    await sendWhatsApp(from,
      `Hello ${tourist.name}!

Reply SOS for emergency help.
Reply INFO for your trip details.
Reply HELP for all commands.`
    )
  }

  res.sendStatus(200)
}