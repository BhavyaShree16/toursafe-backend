import twilio from 'twilio'
import dotenv from 'dotenv'
dotenv.config()

const getClient = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  if (!sid || !token) throw new Error('Twilio credentials missing')
  return twilio(sid, token)
}

const formatPhone = (phone) => {
  // Remove all spaces, dashes, brackets
  let clean = phone.replace(/[\s\-\(\)]/g, '')
  // Remove any leading = signs (n8n expression artifact)
  clean = clean.replace(/^=+/, '')
  // Add + if not present
  if (!clean.startsWith('+')) {
    clean = '+' + clean
  }
  return clean
}

export const sendWhatsApp = async (to, message) => {
  const client = getClient()
  const cleanTo = formatPhone(to)

  console.log(`Sending WhatsApp to: whatsapp:${cleanTo}`)

  const result = await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM,
    to: `whatsapp:${cleanTo}`,
    body: message,
  })

  console.log('WhatsApp sent:', result.sid)
  return result
}