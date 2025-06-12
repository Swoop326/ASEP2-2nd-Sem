// routes/auth.js (Server-side logic)
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// POST /api/signup
router.post("/signup", async (req, res) => {
    const { username, phone, email, password } = req.body;
    
    if (!username || !phone || !password) {
        return res.status(400).json({ error: "Username, phone, and password are required." });
    }

    try {
        const existingUser = await User.findOne({
            $or: [
                { username },
                { phone },
                ...(email ? [{ email }] : [])
            ]
        });

        if (existingUser) {
            if (existingUser.username === username) {
                return res.status(409).json({ error: "Username is already taken." });
            }
            if (existingUser.phone === phone) {
                return res.status(409).json({ error: "Phone number is already registered." });
            }
            if (email && existingUser.email === email) {
                return res.status(409).json({ error: "Email is already registered." });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            phone,
            email,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        console.error("❌ Signup error:", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

// POST /api/login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required." });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid username or password." });
        }

        res.status(200).json({ message: "Login successful!" });
    } catch (err) {
        console.error("❌ Login error:", err);
        res.status(500).json({ error: "Internal server error. Please try again." });
    }
});

module.exports = router;
