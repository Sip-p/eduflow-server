// import nodemailer from 'nodemailer';

// const transporter=nodemailer.createTransport({
//     service:'gmail',
//     auth:{
//         user:process.env.EMAIL_USER,
//         pass:process.env.EMAIL_PASS
//     }
// })

// export default transporter;


// import nodemailer from "nodemailer";

// Using Brevo HTTP API directly to avoid SMTP port timeouts
const transporter = {
    sendMail: async (options) => {
        let senderEmail = process.env.BREVO_EMAIL;
        let senderName = "EduFlow Support";
        
        // Extract sender name and email if formatted like "Name <email@domain.com>"
        if (options.from) {
            const match = options.from.match(/(?:"?([^"]*)"?\s)?<?([^>]*)>?/);
            if (match) {
                if (match[1]) senderName = match[1].trim();
                if (match[2]) senderEmail = match[2].trim();
            }
        }

        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': process.env.BREVO_SMTP_KEY,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                sender: { email: senderEmail, name: senderName },
                to: [{ email: options.to }],
                subject: options.subject,
                htmlContent: options.html
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Brevo API Error: ${JSON.stringify(errorData)}`);
        }

        return await response.json();
    }
};

export default transporter;