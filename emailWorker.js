const nodemailer = require("nodemailer");
const Queue = require("bull");
const path = require("path");

// Create an email queue
const emailQueue = new Queue("emailQueue", {
    redis: {
        host: "127.0.0.1",
        port: 6379
    }
});

// Configure email transporter
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "dipanshutiwari1155@gmail.com",
        pass: "mlldditievdzdiqg"
    }
});

// Process the email queue
emailQueue.process(async (job) => {
    const { to, subject, message, attachment } = job.data;

    try {
        const mailOptions = {
            from: "dipanshutiwari1155@gmail.com",
            to,
            subject,
            text: message,
            attachments: attachment ? [
                {
                    filename: path.basename(attachment),  // Extract filename from path
                    path: attachment                        // Full path to the file
                }
            ] : []
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
    }
});

console.log("Email worker started...");
