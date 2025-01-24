// File: models/Role.js

const mongoose = require('mongoose');

// Define the Role schema
const RoleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true, // Ensure role names are unique
  },
});

module.exports = mongoose.model('Role', RoleSchema);
