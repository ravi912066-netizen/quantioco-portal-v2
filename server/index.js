const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'https://client-ten-mu-84.vercel.app',
  'https://quantioco.vercel.app',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all for demo
    }
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/doubts', require('./routes/doubts'));
app.use('/api/live-classes', require('./routes/liveClasses'));

app.get('/', (req, res) => res.json({ message: 'Quantioco.io API Running ✅' }));

// Seed demo accounts
async function seedDemoAccounts() {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const count = await User.countDocuments({ email: { $in: ['admin@quantioco.io', 'student@quantioco.io'] } });
    if (count === 0) {
      const adminPass = await bcrypt.hash('Admin@123', 10);
      const studentPass = await bcrypt.hash('Student@123', 10);
      await User.create([
        { name: 'Admin', email: 'admin@quantioco.io', password: adminPass, role: 'admin', isApproved: true, phone: '9999999999' },
        { name: 'Demo Student', email: 'student@quantioco.io', password: studentPass, role: 'student', isApproved: true, phone: '8888888888' }
      ]);
      console.log('✅ Demo accounts seeded: admin@quantioco.io / Admin@123 | student@quantioco.io / Student@123');
    }
  } catch (e) {
    console.error('Seed error:', e.message);
  }
}

// Start server
async function startServer() {
  const PORT = process.env.PORT || 5005;

  const mongoUri = process.env.MONGO_URI;

  if (mongoUri && mongoUri !== 'undefined' && !mongoUri.includes('localhost')) {
    // Use real MongoDB (production)
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected (Atlas)');
    } catch (err) {
      console.error('❌ MongoDB Atlas error:', err.message);
      await startMemoryMongo();
    }
  } else {
    // Use in-memory MongoDB (demo/development without external DB)
    await startMemoryMongo();
  }

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  await seedDemoAccounts();
}

async function startMemoryMongo() {
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ In-memory MongoDB started (demo mode)');
  } catch (err) {
    console.error('❌ In-memory MongoDB failed:', err.message);
    // Try localhost as last resort
    try {
      await mongoose.connect('mongodb://localhost:27017/quantioco');
      console.log('✅ MongoDB connected (localhost)');
    } catch (e2) {
      console.error('❌ All DB connections failed:', e2.message);
    }
  }
}

startServer().catch(err => {
  console.error('Server start error:', err);
  process.exit(1);
});

module.exports = app;
