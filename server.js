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
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

/**
 * Endpoint para proporcionar configuraciones públicas al frontend
 * Solo expone las variables que son seguras para compartir
 */
app.get('/api/config', (req, res) => {
  res.json({
    turnstileSiteKey: process.env.TURNSTILE_SITE_KEY
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
  try {
    const response = await axios.post(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      new URLSearchParams({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data.success;
  } catch (error) {
    console.error('Error verifying Turnstile token:', error);
    return false;
  }
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
    console.log('Received form submission:', req.body);
    
    // Extract form data
    const { name, email, phone, service, message } = req.body;
    const turnstileToken = req.body['cf-turnstile-response'];
    
    // Basic validation
    if (!name || !email || !phone || !service || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Todos los campos son requeridos' 
      });
    }
    
    // Verify Turnstile token
    if (!turnstileToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Por favor, complete la verificación de seguridad' 
      });
    }

    // Verify token with Cloudflare
    const isValidToken = await verifyTurnstileToken(turnstileToken);
    if (!isValidToken) {
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
    
    // Send success response
    res.status(200).json({ 
      success: true, 
      message: 'Mensaje enviado correctamente' 
    });
    
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error al enviar el mensaje. Por favor, intente nuevamente.' 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using email: ${process.env.EMAIL_USER}`);
});