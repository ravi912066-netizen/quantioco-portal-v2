const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'quantioco_super_secret_jwt_key_2024';

// CORS - allow all origins for simplicity
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================================
// IN-MEMORY DEMO MODE (when no MongoDB available)
// ============================================================
let demoMode = false;

// In-memory stores
const memDB = {
  users: [],
  courses: [],
  assignments: [],
  doubts: [],
  liveClasses: [],
};

async function seedDemoMemory() {
  const adminPass = await bcrypt.hash('Admin@123', 10);
  const studentPass = await bcrypt.hash('Student@123', 10);
  memDB.users = [
    { _id: 'admin001', id: 'admin001', name: 'Admin', email: 'admin@quantioco.io', password: adminPass, role: 'admin', isApproved: true, xp: 500, avatar: '', enrolledCourses: [], phone: '9999999999', cfHandle: '', cfRating: 0, cfMaxRating: 0, cfRank: '' },
    { _id: 'student001', id: 'student001', name: 'Demo Student', email: 'student@quantioco.io', password: studentPass, role: 'student', isApproved: true, xp: 120, avatar: '', enrolledCourses: [], phone: '8888888888', cfHandle: '', cfRating: 0, cfMaxRating: 0, cfRank: '' },
  ];
}

function genToken(id) { return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' }); }
function safeUser(u) { return { id: u._id, _id: u._id, name: u.name, email: u.email, role: u.role, xp: u.xp, avatar: u.avatar, isApproved: u.isApproved, enrolledCourses: u.enrolledCourses, cfHandle: u.cfHandle, cfRating: u.cfRating, cfMaxRating: u.cfMaxRating, cfRank: u.cfRank }; }

// ============================================================
// DEMO AUTH ROUTES
// ============================================================
const demoAuth = express.Router();

demoAuth.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = memDB.users.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
  if (!user.isApproved) return res.status(403).json({ message: 'Account pending approval' });
  res.json({ token: genToken(user._id), user: safeUser(user) });
});

demoAuth.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  if (memDB.users.find(u => u.email === email)) return res.status(400).json({ message: 'Email already exists' });
  const hashed = await bcrypt.hash(password, 10);
  const id = 'user_' + Date.now();
  const user = { _id: id, id, name, email, phone: phone || '', password: hashed, role: 'student', isApproved: true, xp: 0, avatar: '', enrolledCourses: [], cfHandle: '', cfRating: 0, cfMaxRating: 0, cfRank: '' };
  memDB.users.push(user);
  res.status(201).json({ token: genToken(id), user: safeUser(user) });
});

demoAuth.post('/send-otp', (req, res) => res.json({ message: 'OTP sent (demo mode)', mockOtp: '123456' }));
demoAuth.post('/login-send-otp', (req, res) => res.json({ message: 'OTP sent (demo mode)', mockOtp: '123456' }));
demoAuth.post('/login-verify', (req, res) => {
  const { email } = req.body;
  const user = memDB.users.find(u => u.email === email);
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({ token: genToken(user._id), user: safeUser(user) });
});

// Demo middleware
function demoProtect(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = memDB.users.find(u => u._id === decoded.id) || { _id: decoded.id, role: 'student' };
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
}

function demoAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  next();
}

// Demo courses routes
const demoCourses = express.Router();
demoCourses.get('/', demoProtect, (req, res) => res.json(memDB.courses));
demoCourses.post('/', demoProtect, demoAdmin, (req, res) => {
  const course = { _id: 'c_' + Date.now(), ...req.body, enrolledStudents: [], createdAt: new Date() };
  memDB.courses.push(course);
  res.status(201).json(course);
});
demoCourses.put('/:id', demoProtect, demoAdmin, (req, res) => {
  const idx = memDB.courses.findIndex(c => c._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  memDB.courses[idx] = { ...memDB.courses[idx], ...req.body };
  res.json(memDB.courses[idx]);
});
demoCourses.delete('/:id', demoProtect, demoAdmin, (req, res) => {
  memDB.courses = memDB.courses.filter(c => c._id !== req.params.id);
  res.json({ message: 'Deleted' });
});
demoCourses.post('/:id/enroll', demoProtect, (req, res) => {
  const course = memDB.courses.find(c => c._id === req.params.id);
  if (!course) return res.status(404).json({ message: 'Course not found' });
  if (!course.enrolledStudents.includes(req.user._id)) course.enrolledStudents.push(req.user._id);
  const user = memDB.users.find(u => u._id === req.user._id);
  if (user && !user.enrolledCourses.includes(req.params.id)) user.enrolledCourses.push(req.params.id);
  res.json({ message: 'Enrolled' });
});

// Demo assignments routes
const demoAssignments = express.Router();
demoAssignments.get('/', demoProtect, (req, res) => res.json(memDB.assignments));
demoAssignments.post('/', demoProtect, demoAdmin, (req, res) => {
  const a = { _id: 'a_' + Date.now(), ...req.body, createdBy: req.user._id, createdAt: new Date() };
  memDB.assignments.push(a);
  res.status(201).json(a);
});
demoAssignments.put('/:id', demoProtect, demoAdmin, (req, res) => {
  const idx = memDB.assignments.findIndex(a => a._id === req.params.id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  memDB.assignments[idx] = { ...memDB.assignments[idx], ...req.body };
  res.json(memDB.assignments[idx]);
});
demoAssignments.delete('/:id', demoProtect, demoAdmin, (req, res) => {
  memDB.assignments = memDB.assignments.filter(a => a._id !== req.params.id);
  res.json({ message: 'Deleted' });
});
demoAssignments.post('/:id/submit', demoProtect, (req, res) => res.status(201).json({ message: 'Submitted', xpAwarded: 50 }));
demoAssignments.get('/submissions/me', demoProtect, (req, res) => res.json([]));
demoAssignments.get('/submissions/all', demoProtect, demoAdmin, (req, res) => res.json([]));
demoAssignments.put('/:id/attempt', demoProtect, (req, res) => res.json({ message: 'Attempt recorded' }));

// Demo users routes
const demoUsers = express.Router();
demoUsers.get('/me', demoProtect, (req, res) => {
  const user = memDB.users.find(u => u._id === req.user._id);
  res.json(user || req.user);
});
demoUsers.put('/me', demoProtect, (req, res) => {
  const idx = memDB.users.findIndex(u => u._id === req.user._id);
  if (idx !== -1) memDB.users[idx] = { ...memDB.users[idx], ...req.body };
  res.json(memDB.users[idx] || req.user);
});
demoUsers.get('/', demoProtect, demoAdmin, (req, res) => res.json(memDB.users.map(safeUser)));
demoUsers.put('/:id/approve', demoProtect, demoAdmin, (req, res) => {
  const u = memDB.users.find(u => u._id === req.params.id);
  if (u) u.isApproved = true;
  res.json({ message: 'Approved' });
});

// Demo doubts routes
const demoDoubts = express.Router();
demoDoubts.get('/', demoProtect, demoAdmin, (req, res) => res.json(memDB.doubts));
demoDoubts.post('/', demoProtect, (req, res) => {
  const d = { _id: 'd_' + Date.now(), ...req.body, student: { _id: req.user._id, name: req.user.name, email: req.user.email }, resolved: false, createdAt: new Date() };
  memDB.doubts.push(d);
  res.status(201).json(d);
});
demoDoubts.put('/:id', demoProtect, demoAdmin, (req, res) => {
  const d = memDB.doubts.find(d => d._id === req.params.id);
  if (d) { d.answer = req.body.answer; d.resolved = true; }
  res.json(d || {});
});

// Demo live classes routes
const demoLive = express.Router();
demoLive.get('/', demoProtect, (req, res) => res.json(memDB.liveClasses));
demoLive.post('/', demoProtect, demoAdmin, (req, res) => {
  const lc = { _id: 'lc_' + Date.now(), ...req.body, status: 'active', instructor: { _id: req.user._id, name: 'Admin' }, attendees: [], materials: [], createdAt: new Date() };
  memDB.liveClasses.push(lc);
  res.status(201).json(lc);
});
demoLive.post('/:id/join', demoProtect, (req, res) => res.json({ message: 'Joined' }));
demoLive.put('/:id/end', demoProtect, demoAdmin, (req, res) => {
  const lc = memDB.liveClasses.find(l => l._id === req.params.id);
  if (lc) lc.status = 'ended';
  res.json(lc || {});
});
demoLive.post('/:id/materials', demoProtect, demoAdmin, (req, res) => res.json({}));

// Demo payments / problems routes (stub)
const demoPayments = express.Router();
demoPayments.post('/create-order', demoProtect, (req, res) => res.json({ message: 'Payment demo mode' }));
demoPayments.post('/verify', demoProtect, (req, res) => res.json({ message: 'Verified (demo)' }));
demoPayments.post('/enroll-free', demoProtect, (req, res) => res.json({ message: 'Enrolled (demo)' }));

const demoProblems = express.Router();
demoProblems.get('/', demoProtect, (req, res) => res.json([]));
demoProblems.post('/', demoProtect, demoAdmin, (req, res) => res.status(201).json({ _id: 'p_' + Date.now(), ...req.body }));

// ============================================================
// HEALTH CHECK
// ============================================================
app.get('/', (req, res) => res.json({ message: 'Quantioco.io API Running ✅', mode: demoMode ? 'demo (in-memory)' : 'production' }));

// ============================================================
// START SERVER
// ============================================================
async function startServer() {
  const PORT = process.env.PORT || 5005;
  const mongoUri = process.env.MONGO_URI;
  const hasRealMongo = mongoUri && mongoUri !== 'undefined' && mongoUri.startsWith('mongodb');

  if (hasRealMongo) {
    try {
      await mongoose.connect(mongoUri);
      console.log('✅ MongoDB connected');
      // Use real routes
      app.use('/api/auth', require('./routes/auth'));
      app.use('/api/courses', require('./routes/courses'));
      app.use('/api/assignments', require('./routes/assignments'));
      app.use('/api/users', require('./routes/users'));
      app.use('/api/problems', require('./routes/problems'));
      app.use('/api/payments', require('./routes/payments'));
      app.use('/api/doubts', require('./routes/doubts'));
      app.use('/api/live-classes', require('./routes/liveClasses'));
    } catch (err) {
      console.error('❌ MongoDB error, switching to demo mode:', err.message);
      demoMode = true;
    }
  } else {
    console.log('ℹ️  No MONGO_URI — starting in demo mode (in-memory data)');
    demoMode = true;
  }

  if (demoMode) {
    await seedDemoMemory();
    app.use('/api/auth', demoAuth);
    app.use('/api/courses', demoCourses);
    app.use('/api/assignments', demoAssignments);
    app.use('/api/users', demoUsers);
    app.use('/api/doubts', demoDoubts);
    app.use('/api/live-classes', demoLive);
    app.use('/api/payments', demoPayments);
    app.use('/api/problems', demoProblems);
    console.log('✅ Demo mode: admin@quantioco.io / Admin@123 | student@quantioco.io / Student@123');
  }

  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

startServer().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

module.exports = app;
