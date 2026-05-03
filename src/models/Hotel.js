import mongoose from 'mongoose'

const hotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  city: { type: String },
   isApproved: { type: Boolean, default: false }
}, { timestamps: true })

export default mongoose.model('Hotel', hotelSchema)