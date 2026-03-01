const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const OTP = require('../models/OTP');
const twilio = require('twilio');

// Initialize Twilio client if env vars exist
const twilioClient = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
    ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
    : null;

// POST /api/auth/send-otp (For Registration)
router.post('/send-otp', async (req, res) => {
    try {
        const { phone } = req.body;
        const identifier = phone; // Using phone as identifier for registration
        const otpValue = Math.floor(100000 + Math.random() * 900000).toString();

        // Save OTP to DB
        await OTP.findOneAndUpdate(
            { identifier },
            { otp: otpValue, createdAt: new Date() },
            { upsert: true, new: true }
        );

        if (twilioClient && process.env.TWILIO_PHONE_NUMBER) {
            try {
                await twilioClient.messages.create({
                    body: `Your Quantioco.io verification code is: ${otpValue}`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: phone.startsWith('+') ? phone : `+91${phone}` // Assuming India default if no country code
                });
                console.log(`[AUTH] Real SMS OTP sent to ${phone}`);
                return res.status(200).json({ message: 'OTP sent to your mobile via SMS!' });
            } catch (twilioErr) {
                console.error('[AUTH] Twilio Error:', twilioErr);
                // Fallback to console if Twilio fails
            }
        }

        // MOCK / FALLBACK: Log OTP for development
        console.log(`\n-----------------------------------`);
        console.log(`[AUTH] MOCK OTP for ${identifier}: ${otpValue}`);
        console.log(`-----------------------------------\n`);

        res.status(200).json({ message: 'OTP generated (Check server logs - add Twilio keys for real SMS)' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role, otp } = req.body;
        const identifier = phone; // using phone for registration verification

        // Master admin auto-approval logic
        const isMasterAdmin = email === 'ravisyro@gmail.com' || email === 'ravi@quantioco.io' || role === 'admin';

        if (isMasterAdmin) {
            // Verify OTP ONLY for admins
            const otpRecord = await OTP.findOne({ identifier, otp });
            if (!otpRecord) return res.status(400).json({ message: 'Invalid or expired OTP' });
            await OTP.deleteOne({ _id: otpRecord._id });
        }

        // Check if user already exists
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already registered' });

        // Create user. Everyone is auto-approved now for instant access
        const user = await User.create({ name, email, phone, password, role: role || 'student', isApproved: true });

        if (!user.isApproved) {
            return res.status(201).json({
                message: 'Registration successful. Waiting for Admin approval.',
                pendingApproval: true
            });
        }

        res.status(201).json({
            token: generateToken(user._id),
            user: {
                id: user._id, _id: user._id, name: user.name, email: user.email,
                role: user.role, xp: user.xp, avatar: user.avatar, isApproved: user.isApproved,
                enrolledCourses: user.enrolledCourses, cfHandle: user.cfHandle, cfRating: user.cfRating, cfMaxRating: user.cfMaxRating, cfRank: user.cfRank
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password)))
            return res.status(401).json({ message: 'Invalid credentials' });

        if (!user.isApproved) {
            return res.status(403).json({ message: 'Account is pending Admin approval.' });
        }

        res.json({
            token: generateToken(user._id),
            user: {
                id: user._id, _id: user._id, name: user.name, email: user.email,
                role: user.role, xp: user.xp, avatar: user.avatar, isApproved: user.isApproved,
                enrolledCourses: user.enrolledCourses, cfHandle: user.cfHandle, cfRating: user.cfRating, cfMaxRating: user.cfMaxRating, cfRank: user.cfRank
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login-send-otp
router.post('/login-send-otp', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const otpValue = Math.floor(100000 + Math.random() * 900000).toString();

        await OTP.findOneAndUpdate(
            { identifier: email },
            { otp: otpValue, createdAt: new Date() },
            { upsert: true, new: true }
        );

        console.log(`\n-----------------------------------`);
        console.log(`[AUTH] LOGIN OTP for ${email}: ${otpValue}`);
        console.log(`-----------------------------------\n`);

        res.status(200).json({ message: 'Login OTP sent successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST /api/auth/login-verify
router.post('/login-verify', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Check OTP
        const otpRecord = await OTP.findOne({ identifier: email, otp });
        if (!otpRecord) return res.status(401).json({ message: 'Invalid or expired OTP' });

        // Find User
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Delete OTP after success
        await OTP.deleteOne({ _id: otpRecord._id });

        res.json({
            token: generateToken(user._id),
            user: {
                id: user._id, _id: user._id, name: user.name, email: user.email,
                role: user.role, xp: user.xp, avatar: user.avatar, isApproved: user.isApproved,
                enrolledCourses: user.enrolledCourses, cfHandle: user.cfHandle, cfRating: user.cfRating, cfMaxRating: user.cfMaxRating, cfRank: user.cfRank
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
