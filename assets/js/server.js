/*
==============================================
EMAIL SERVER TABLE OF CONTENTS
==============================================

1. Dependencies & Configuration
2. Middleware Setup
3. Email Service Configuration
4. Contact Form Handler
5. Server Initialization

==============================================
*/

// 1. Dependencies & Configuration
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// 2. Middleware Setup
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static('./'));

// Configure rate limiting (5 requests per 15 minutes)
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Too many requests, please try again later.' }
});

// Input validation rules
const validateContact = [
    body('name').trim().notEmpty().isLength({ min: 2, max: 100 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('service').trim().notEmpty().isLength({ max: 100 }),
    body('message').trim().notEmpty().isLength({ min: 10, max: 1000 })
];

// 3. Email Service Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 4. Contact Form Handler
app.post('/api/contact', contactLimiter, validateContact, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        const { name, email, service, message } = req.body;
        console.log('Received form submission:', { name, email, service });

        // Configure and send email
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: `New Contact Form Submission - ${service}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
        res.status(200).json({ message: 'Email sent successfully' });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// 5. Server Initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});