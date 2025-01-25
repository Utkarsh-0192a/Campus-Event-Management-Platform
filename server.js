// File: server.js

const express = require('express');
const mongoose = require('mongoose');
// const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const roleRoutes = require('./routes/roles');
const userRoutes = require('./routes/users');
const Role = require('./models/Role');
const cors = require('cors');
const path = require('path');
require('dotenv').config();  // Load environment variables from .env file

// Initialize dotenv for environment variables
// dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Middleware for JSON parsing
app.use(express.json());

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/your_database_name';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/roles', roleRoutes);

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'login.html'));
});


// Add this to your server startup script (e.g., server.js) to ensure roles are added before starting the app
 // Import Role model

async function createRoles() {
    const roles = ['student', 'organizer', 'faculty','admin'];
    
    for (const roleName of roles) {
        const roleExists = await Role.findOne({ name: roleName });
        if (!roleExists) {
            await new Role({ name: roleName }).save();
        }
    }
}

// Call the function to create roles
createRoles().then(() => console.log('Roles created/checked')).catch(err => console.error(err));


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
