import dotenv from 'dotenv';
dotenv.config();

import transporter from './config/mailer.js';

async function test() {
    console.log("Testing Brevo HTTP Mailer...");
    console.log("Using API Key:", process.env.BREVO_SMTP_KEY ? "Loaded" : "Missing");
    console.log("Using Sender Email:", process.env.BREVO_EMAIL ? "Loaded" : "Missing");
    
    try {
        const result = await transporter.sendMail({
            from: `"EduFlow Test" <${process.env.BREVO_EMAIL}>`,
            to: process.env.BREVO_EMAIL || "test@example.com", // Send to self
            subject: "Test Email from EduFlow Backend",
            html: "<h1>It works!</h1><p>Brevo HTTP API is successfully configured.</p>"
        });
        console.log("✅ Email sent successfully!");
        console.log(result);
    } catch (err) {
        console.error("❌ Failed to send email:");
        console.error(err);
    }
}

test();
