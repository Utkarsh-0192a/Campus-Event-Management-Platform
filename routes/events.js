// File: routes/events.js

const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const Event = require('../models/Event');
const User = require('../models/User');

// Middleware to populate req.user.role
const populateUserRole = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('role');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        req.user.role = user.role;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error populating user role', error: error.message });
    }
};

// Only Admin and Organizer can create events
router.post('/create-event', authenticate, populateUserRole, authorize(['admin', 'organizer']), async (req, res) => {
    try {
        const { name, date, timestart, timeend, venue, category, description } = req.body;

        if (!name || !date || !timestart || !timeend || !venue || !category || !description) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const event = new Event({
            name,
            date,
            stime: timestart,
            etime: timeend,
            venue,
            category,
            description,
            organizer: req.user._id, // Link the event to the logged-in organizer
        });

        await event.save();
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
});

router.post('/register/:eventId', authenticate, async (req, res) => {
    try {
        const eventId = req.params.eventId;
        const studentId = req.user.id;

        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (event.registeredStudents.includes(studentId)) {
            return res.status(400).json({ message: 'You are already registered for this event' });
        }

        // Register the student
        event.registeredStudents.push(studentId);
        await event.save();

        // Create QR code directory if it doesn't exist
        const qrCodeDir = path.join(__dirname, '../qrcodes');
        if (!fs.existsSync(qrCodeDir)) {
            fs.mkdirSync(qrCodeDir);
        }

        // Generate QR code data
        const qrData = {
            eventId,
            studentId,
            registrationId: `${eventId}-${studentId}`,
            eventName: event.name,
            date: event.date
        };

        // Save QR code locally
        const qrCodePath = path.join(qrCodeDir, `${eventId}-${studentId}.png`);
        await QRCode.toFile(qrCodePath, JSON.stringify(qrData));

        // Get the user's email
        const user = await User.findById(studentId);
        if (!user || !user.email) {
            throw new Error('User email not found');
        }

        // Prepare email data with the QR code file
        const emailData = {
            to: user.email,
            subject: `Registration Confirmation - ${event.name}`,
            message: `Thank you for registering for ${event.name}. Please find your QR code attached.`,
            attachment: path.join(__dirname, '..', 'qrcodes', `${eventId}-${studentId}.png`)
        };

        // Send email using your email service
        const emailResponse = await fetch('http://localhost:5000/send-email', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });

        if (!emailResponse.ok) {
            throw new Error('Failed to send email');
        }

        res.status(200).json({
            message: 'Successfully registered for the event. QR code sent via email.',
            registrationId: qrData.registrationId
        });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for the event', error: error.message });
    }
});

// Route to get upcoming events
router.get('/upcoming-events', async (req, res) => {
    try {
        const { category } = req.query;
        const today = new Date();
        const query = { date: { $gt: today } };
        
        if (category) {
            query.category = category;
        }
        
        const events = await Event.find(query)
            .sort({ date: 1 })
            .populate('organizer', 'name');
        
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching upcoming events', error: error.message });
    }
});

// Route to get ongoing events
router.get('/ongoing-events', async (req, res) => {
    try {
        const { category } = req.query;
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        
        const query = { date: { $gte: startOfDay, $lte: endOfDay } };
        
        if (category) {
            query.category = category;
        }
        
        const events = await Event.find(query)
            .sort({ date: 1 })
            .populate('organizer', 'name');
        
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching ongoing events', error: error.message });
    }
});

// Route to get events organized by the logged-in organizer
router.get('/organized-events', authenticate, async (req, res) => {
    try {
        console.log('Request received at /organized-events'); // Log request received

        if (!req.user) {
            console.log('User not authenticated'); // Log if user is not authenticated
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const events = await Event.find({ organizer: req.user._id })
            .sort({ date: 1 })
            .populate('organizer', 'name');

        res.status(200).json(events);
    } catch (error) {
        console.error('Error fetching organized events:', error); // Log the error
        res.status(500).json({ message: 'Error fetching organized events', error: error.message });
    }
});

// Get events the student is registered for
router.get('/my-events', authenticate, async (req, res) => {
    try {
        const studentId = req.user.id;
        const events = await Event.find({ registeredStudents: studentId });

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching registered events', error: error.message });
    }
});

router.post('/verify', async (req, res) => {
    try {
        const { qrData } = req.body;

        // Parse the QR code data
        const { eventId, studentId } = JSON.parse(qrData);

        // Check if the event exists and the student is registered
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        if (!event.registeredStudents.includes(studentId)) {
            return res.status(400).json({ message: 'Student not registered for this event' });
        }

        res.status(200).json({ message: 'QR Code verified successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying QR Code', error: error.message });
    }
});

module.exports = router;
