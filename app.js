const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'index.html'));
});

// PAGES CONNECTING TO HOME
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'login.html'));
});

app.get('/home/student/profile', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'profile.html'));
});

app.get('/home/student', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'student.html'));
});

app.get('/home/organizer/addevent', (req, res) => {
  res.sendFile(path.join(__dirname, 'template', 'addEvent.html'));
});


// POST REQUESTS

app.post('/submit/login', (req, res) => {
  const { username, password, role } = req.body;

  var result;
  if (username == "dipanshu" && password == "hello"){
    result = 1;
  }
  else result = 0;
  res.json({message: result});
});

app.post('/submit/register', (req, res) => {
  const { name, email, username, password, role } = req.body;

  const result = `The concatenated string is: ${name}, ${email}, ${username}, ${password} ${role}`;

  res.json({ message: result });
});

app.post('/submit/event', (req, res) => {
  const { name, date, timestart, timeend, venue, category } = req.body;

  const result = `The concatenated string is: ${name}, ${date}, ${timestart}, ${timeend} ${venue} ${category}`;

  res.json({ message: result });
});

// LISTENER

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
