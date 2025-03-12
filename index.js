// Import required modules
import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import cron from 'node-cron';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const SECRET_KEY = process.env.SECRET_KEY || '1234567890';

app.use(bodyParser.json());

let users = []; // In-memory storage for users
let events = []; // In-memory storage for events

// Middleware for authentication
const authenticate = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access denied' });
    
    try {
        const verified = jwt.verify(token, SECRET_KEY);
        req.user = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Invalid token' });
    }
};

// User registration
app.post('/register', (req, res) => {
    const { username, password } = req.body;
    if (users.find(user => user.username === username)) {
        return res.status(400).json({ message: 'User already exists' });
    }
    users.push({ username, password });
    res.json({ message: 'User registered successfully' });
});

// User login
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});

// Create an event
app.post('/events', authenticate, (req, res) => {
    const { name, description, date, time, category, reminder } = req.body;
    const event = { id: events.length + 1, name, description, date, time, category, reminder, username: req.user.username };
    events.push(event);
    res.json({ message: 'Event created', event });
});

// Get all events for the logged-in user
app.get('/events', authenticate, (req, res) => {
    const userEvents = events.filter(event => event.username === req.user.username);
    res.json(userEvents);
});

// Get events sorted by date
app.get('/events/sorted/date', authenticate, (req, res) => {
    const userEvents = events.filter(event => event.username === req.user.username)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
    res.json(userEvents);
});

// Get events filtered by category
app.get('/events/category/:category', authenticate, (req, res) => {
    const { category } = req.params;
    const userEvents = events.filter(event => event.username === req.user.username && event.category === category);
    res.json(userEvents);
});

// Reminder system (simulated with console log)
cron.schedule('* * * * *', () => {
    const now = new Date();
    events.forEach(event => {
        const eventDateTime = new Date(`${event.date} ${event.time}`);
        if (event.reminder && eventDateTime - now <= event.reminder * 60000) {
            console.log(`Reminder: ${event.name} is happening soon!`);
        }
    });
});

// Export the app for testing
export default app;
