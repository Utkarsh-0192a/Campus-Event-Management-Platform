// File: models/Event.js

const mongoose = require('mongoose');

// Define Event Schema
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    stime: { type: String, required: true },
    etime: { type: String, required: true },
    venue: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the organizer
    created_at: { type: Date, default: Date.now },
    registeredStudents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
