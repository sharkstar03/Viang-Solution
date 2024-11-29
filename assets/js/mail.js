const express = require('express');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());

// Configurar el transporter de correo
const transporter = nodemailer.createTransport({
    service: 'gmail', // O tu servicio de correo preferido
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, service, message } = req.body;

        // Configurar el correo
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: 'its_shark03@protonmail.com', // Tu correo de negocio
            subject: `New Contact Form Submission - ${service}`,
            html: `
                <h3>New Contact Form Submission</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Service:</strong> ${service}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        // Enviar el correo
        await transporter.sendMail(mailOptions);

        // Enviar confirmación al cliente
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

        await transporter.sendMail(confirmationMail);

        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
