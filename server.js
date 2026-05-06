import express from 'express'
import mongoose from 'mongoose'
import cors from 'cors'
import dotenv from 'dotenv'
import { createServer } from 'http'
import { Server } from 'socket.io'
import authRoutes from './src/routes/auth.js'
import touristRoutes from './src/routes/tourists.js'
import policeRoutes from './src/routes/police.js'
import whatsappRoutes from './src/routes/whatsapp.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

// CORS — allow everything
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  next()
})

app.use(express.json())

export const io = new Server(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

io.on('connection', (socket) => {
  console.log('Dashboard connected:', socket.id)
  socket.on('disconnect', () => {
    console.log('Dashboard disconnected:', socket.id)
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/tourists', touristRoutes)
app.use('/api/police', policeRoutes)
app.use('/api/whatsapp', whatsappRoutes)

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))

app.get('/api/debug/env', (_, res) => {
  res.json({
    mongo: !!process.env.MONGO_URI,
    jwt: !!process.env.JWT_SECRET,
    twilio_sid: !!process.env.TWILIO_ACCOUNT_SID,
    twilio_token: !!process.env.TWILIO_AUTH_TOKEN,
    twilio_from: process.env.TWILIO_WHATSAPP_FROM,
    port: process.env.PORT,
  })
})

const PORT = process.env.PORT || 4000

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch(err => console.error('DB connection failed:', err))