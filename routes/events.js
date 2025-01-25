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

// Any authenticated user can register for an event
router.post('/register-event/:eventId', authenticate, async (req, res) => {
    const { eventId } = req.params;

    try {
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // Add logic to register the user (if required)
        // Example: Adding user to a participants list in the Event model

        res.status(200).json({ message: 'Successfully registered for the event' });
    } catch (error) {
        res.status(500).json({ message: 'Error registering for event', error: error.message });
    }
});

// Route to get upcoming events
router.get('/upcoming-events', authenticate, async (req, res) => {
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
router.get('/ongoing-events', authenticate, async (req, res) => {
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

module.exports = router;
