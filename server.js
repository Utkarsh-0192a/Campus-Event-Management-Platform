// File: server.js

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const roleRoutes = require('./routes/roles');  // Import role routes
const path = require('path');
// Initialize dotenv for environment variables
dotenv.config();

// Initialize Express app
const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// Middleware
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/roles', roleRoutes);  // Use role routes

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'index.html'));
});

// PAGES CONNECTING TO HOME
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'login.html'));
});

app.post('/submit/login', (req, res) => {
  const { username, password, role } = req.body;

  const result = `The concatenated string is: ${username}${password}${role}`;

  res.json({ message: result });
});

app.post('/submit/register', (req, res) => {
  const { name, email, username, password, role } = req.body;

  const result = `The concatenated string is: ${name}, ${email}, ${username}, ${password} ${role}`;

  res.json({ message: result });
});


// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
