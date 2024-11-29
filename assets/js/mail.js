/*
==============================================
EMAIL SERVER TABLE OF CONTENTS
==============================================

1. Initialization & Configuration
    1.1 Dependencies
    1.2 Express Setup
    1.3 Email Transport Configuration
2. Email Routes
    2.1 Contact Form Handler
    2.2 Email Templates
3. Server Configuration
    3.1 Port Setup
    3.2 Server Startup

==============================================
*/

// 1.1 Dependencies
const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

// 1.2 Express Setup
const app = express();
app.use(express.json());

// 1.3 Email Transport Configuration
/**
 * Configure nodemailer transport with Gmail
 * Requires EMAIL_USER and EMAIL_PASS environment variables
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 2.1 Contact Form Handler
/**
 * POST endpoint to handle contact form submissions
 * Sends notification email to business and confirmation to customer
 * @param {Object} req.body - Contains name, email, service, and message
 */
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, service, message } = req.body;

        // 2.2 Email Templates
        // Business notification email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'its_shark03@protonmail.com',
            subject: `New Contact Form Submission - ${service}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        // Customer confirmation email
        const confirmationMail = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Thank you for contacting VIANG SOLUTION',
            html: `
                <h3>Thank you for contacting us!</h3>
                <p>Dear ${name},</p>
                <p>We have received your message and will get back to you shortly.</p>
                <p>Best regards,</p>
                <p>VIANG SOLUTION Team</p>
            `
        };

        // Send both emails
        await Promise.all([
            transporter.sendMail(mailOptions),
            transporter.sendMail(confirmationMail)
        ]);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// 3.1 Port Setup
const PORT = process.env.PORT || 3000;

// 3.2 Server Startup
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});