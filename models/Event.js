// File: models/Event.js

const mongoose = require('mongoose');

// Define Event Schema
const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    venue: { type: String },
    description: { type: String },
    organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },  // Reference to the organizer
    created_at: { type: Date, default: Date.now },
});

const Event = mongoose.model('Event', eventSchema);
module.exports = Event;
