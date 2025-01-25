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
require('dotenv').config();
const authorize  = require('./middleware/authorize');
const authenticate = require('./middleware/authenticate');
const Queue = require('bull');

// Initialize dotenv for environment variables
// dotenv.config();

// Initialize Express app
const app = express();

// Enable CORS
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/template', express.static(path.join(__dirname, 'template'))); // Serve template directory

// Middleware for JSON parsing
app.use(express.json());

// Middleware to prevent caching of protected pages
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

// MongoDB connection
const mongoURI = 'mongodb://localhost:27017/campus_events';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/roles', roleRoutes);

const emailQueue = new Queue('emailQueue', {
  redis: {
    host: '127.0.0.1',
    port: 6379
  }
});

// Serve HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'index.html'));
});

app.get('/home/student', authenticate, authorize('student'), (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'student.html'));
});

app.get('/home/organizer', authenticate, authorize('organizer'), (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'organizer.html'));
});

app.get('/home/organizer/addevent', authenticate, authorize('organizer'), (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'addEvent.html'));
});

app.get('/home/student/profile', authenticate, authorize('student'), (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'studProfile.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'login.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'logout.html'));
});

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).sendFile(path.join(__dirname, 'template', 'unauthorized.html'));
  } else {
    next(err);
  }
});

// Add this to your server startup script (e.g., server.js) to ensure roles are added before starting the app
// Import Role model

async function createRoles() {
    const roles = ['student', 'organizer', 'faculty', 'admin'];
    
    for (const roleName of roles) {
        const roleExists = await Role.findOne({ name: roleName });
        if (!roleExists) {
            await new Role({ name: roleName }).save();
        }
    }
}

// Call the function to create roles
createRoles().then(() => console.log('Roles created/checked')).catch(err => console.error(err));

// API endpoint to enqueue email
app.post("/send-email", async (req, res) => {
  const { to, subject, message, attachment } = req.body;

  try {
      // Add email to the queue
      await emailQueue.add({ to, subject, message, attachment });
      res.status(200).json({ message: "Email queued successfully!" });
  } catch (error) {
      console.error("Error queuing email:", error);
      res.status(500).json({ message: "Failed to queue email." });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
