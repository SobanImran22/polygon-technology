// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const http = require('http');
const { Server } = require("socket.io");
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());




const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" }
});

app.use(cors());




// Connect to MongoDB
mongoose.connect("mongodb+srv://polygontechnology63:8K0gWH8Xn9S3LOa8@polygontechnology.fomptym.mongodb.net/?retryWrites=true&w=majority&appName=PolygonTechnology", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  number: String,
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

// Withdrawal schema
const withdrawalSchema = new mongoose.Schema({
  name: String,
  /* number: String, */
  amount: Number,
  method: String,
  wallet: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const Withdrawal = mongoose.model("Withdrawal", withdrawalSchema);

// Deposit schema
const depositSchema = new mongoose.Schema({
  name: String,
  phone: String,
  method: String,
  date: { type: Date, default: Date.now },
});
const Deposit = mongoose.model("Deposit", depositSchema);

// Email config
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "tradingbox652@gmail.com",
    pass: "yfye mgux vrfl ldyv", // App Password
  },
});

// Signup
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password, number } = req.body;
    if (!name || !email || !password || !number) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, number });
    await newUser.save();

    const mailOptions = {
      from: "tradingbox652@gmail.com",
      to: email,
      subject: "Welcome to Our Platform!",
      text: `Hello ${name},\n\nThank you for signing up! We're excited to have you on board.`,
    };
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) console.error("Email error:", error);
      else console.log("Email sent:", info.response);
    });

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid email or password" });
    }
    res.status(200).json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Deposit
app.post("/api/deposit", async (req, res) => {
  const { name, phone, method } = req.body;
  if (!name || !phone || !method) {
    return res.status(400).json({ error: "Missing fields" });
  }
  try {
    const newDeposit = new Deposit({ name, phone, method });
    await newDeposit.save();
    res.status(201).json({ message: "Deposit recorded" });
  } catch (err) {
    console.error("Deposit error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Withdraw
app.post("/api/withdraw", async (req, res) => {
  const { name, number, amount, method, wallet } = req.body;
  if (!name || !number || !amount || !method || !wallet) {
    return res.status(400).json({ error: "All fields are required" });
  }
  try {
    const newRequest = new Withdrawal({ name, number, amount, method, wallet });
    await newRequest.save();
    res.status(201).json({ message: "Withdrawal request saved." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// Routes
app.get('/users', async (req, res) => {
  const users = await User.find().sort({ createdAt: -1 });
  res.json(users);
});


// Socket.IO connection
io.on('connection', (socket) => {
  console.log('Admin connected:', socket.id);
});







const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
