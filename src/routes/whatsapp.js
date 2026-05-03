import express from "express";
import { sendWhatsApp } from "../services/whatsapp.js";

const router = express.Router();

router.post('/send', async (req, res) => {
  const { to, message } = req.body;

  try {
    await sendWhatsApp(to, message);
    res.json({ success: true });
  } catch (err) {
    console.error("WhatsApp Error:", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;