const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });
};

const loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    res.json({ success: true, data: { _id: user._id, name: user.name, email: user.email } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
  }
};

const logoutAdmin = (req, res) => {
  res.cookie('jwt', '', { httpOnly: true, expires: new Date(0) });
  res.json({ success: true, data: { message: 'Logged out successfully' } });
};

const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { loginAdmin, logoutAdmin, getMe };