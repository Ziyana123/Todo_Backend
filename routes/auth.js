const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

var router = express.Router();

// Register Route
router.post('/register', async (req, res) => {

    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: "Username and password are required" });
          }
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: "Username already taken" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "New User Created!" });
    } catch (error) {
        res.status(500).json({ message: "Error Creating User", error: error.message });
    }
});

// Fetch All Users
router.get('/', async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid Credentials" });
        }

        // Generate JWT token with expiry
        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRETKEY,
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: "Error Logging In", error: error.message });
    }
});

module.exports = router;
