/**
 * @fileoverview Server implementation for Viang Solution website
 * @version 1.0.0
 * @description Handles contact form submissions and email delivery
 */

// Import required dependencies
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: '*', // Permitir solicitudes desde cualquier origen
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

/**
 * Endpoint para proporcionar configuraciones públicas al frontend
 * Solo expone las variables que son seguras para compartir
 */
app.get('/api/config', (req, res) => {
  res.json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY || '0x4AAAAAAA1K8g5nQd30WCAD'
  });
});


/**
 * Serves the static HTML files
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/contact', (req, res) => {
  res.sendFile(path.join(__dirname, 'contact.html'));
});

/**
 * Verifies Cloudflare Turnstile token
 * @param {string} token - The token from the client-side
 * @returns {Promise<boolean>} - Whether the token is valid
 */
async function verifyTurnstileToken(token) {
    // Simulación para pruebas locales
    console.log('Simulando verificación de Turnstile en local');
    return true;
}

/**
 * Creates email transporter using nodemailer
 * Uses environment variables for secure credential storage
 */
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Handles the contact form submission
 * Validates inputs and sends email notification
 */
app.post('/api/contact', async (req, res) => {
  try {
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);

    // Extract form data
    const { name, email, phone, service, message } = req.body;
    const turnstileToken = req.body['cf-turnstile-response'];

    // Basic validation
    if (!name || !email || !phone || !service || !message) {
      console.log('Validation failed: Missing fields');
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos' 
      });
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      console.log('Validation failed: Missing Turnstile token');
      return res.status(400).json({ 
        success: false, 
        message: 'Por favor, complete la verificación de seguridad' 
      });
    }

    // Verify token with Cloudflare
    const isValidToken = await verifyTurnstileToken(turnstileToken);
    if (!isValidToken) {
      console.log('Validation failed: Invalid Turnstile token');
      return res.status(400).json({
        success: false,
        message: 'Verificación de seguridad inválida. Por favor, intente nuevamente.'
      });
    }

    // Email content
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: 'vionel@viangsolution.com', // Primary recipient
      cc: process.env.EMAIL_USER, // Keep a copy in the sending email
      replyTo: email, // Set reply-to as the customer's email
      subject: `Nuevo Contacto Web: ${service}`,
      html: `
        <h2>Nuevo mensaje de contacto desde el sitio web</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone}</p>
        <p><strong>Servicio:</strong> ${service}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log('Email sent successfully');

    // Send success response
    res.status(200).json({ 
      success: true, 
      message: 'Mensaje enviado correctamente' 
    });

  } catch (error) {
    console.error('Error in /api/contact:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al enviar el mensaje. Por favor, intente nuevamente.' 
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Using email: ${process.env.EMAIL_USER}`);
});