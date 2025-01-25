// File: routes/events.js

const express = require('express');
const router = express.Router();
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
        // Create a new event
        const event = new Event({
            name: req.body.name,
            date: req.body.date,
            stime: req.body.timestart || req.body.stime,
            etime: req.body.timeend || req.body.etime,
            venue: req.body.venue,
            category: req.body.category,
            description: req.body.description,
            organizer: req.user._id, // Link the event to the logged-in organizer
        });

        await event.save();
        res.status(201).json({ message: 'Event created successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
    }
});

// Any authenticated user can register for an event
router.post('/register-event/:eventId', authenticate, async (req, res) => {
    const eventId = req.params.eventId;


    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Logic to register the user (e.g., add user to event's participants list)
        // For simplicity, assuming a basic registration without a "participants" array

        res.status(200).json({ message: 'Successfully registered for the event' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for event', error: error.message });
    }
});

module.exports = router;
