const cookieParser = require('cookie-parser');
app.use(cookieParser());

// Access the token cookie
app.get('/some-endpoint', (req, res) => {
    const token = req.cookies.token; // Retrieve the token
    // console.log('Token:', token);
    res.send('Token received');
});