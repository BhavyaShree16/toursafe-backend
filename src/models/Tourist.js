import mongoose from 'mongoose'

const touristSchema = new mongoose.Schema({
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  touristId: { type: String, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  nationality: { type: String, required: true },
  idNumber: { type: String, required: true },
  checkIn: { type: String, required: true },
  checkOut: { type: String, required: true },
  place: { type: String, required: true },
  district: { type: String, required: true },
  roomNumber: { type: String },
  purpose: { type: String },
  emergencyName: { type: String, required: true },
  emergencyPhone: { type: String, required: true },
  status: { type: String, enum: ['active', 'alert', 'departed'], default: 'active' },
}, { timestamps: true })

export default mongoose.model('Tourist', touristSchema)