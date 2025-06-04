const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Render signup page
exports.showSignup = (req, res) => {
  res.render('signup', { error: null });
};

// Render login page
exports.showLogin = (req, res) => {
  res.render('login', { error: null });
};

// Render verify message page (after signup)
exports.showVerifyMessage = (req, res) => {
  const message = req.session.message || 'Check your email to verify your account.';
  const email = req.session.email || '';
  req.session.message = null;
  res.render('verify-message', { message, email });
};

// Handle user registration with email verification
exports.register = async (req, res) => {
  const { name, email, password, course, year } = req.body;

  try {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
      return res.render('signup', { error: 'User with this email already exists.' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      course,
      year,
      verified: false,
    });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `${process.env.BASE_URL}/verify-email?token=${token}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Sherubtse Ground Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <p>Hello ${name},</p>
        <p>Thank you for registering. Please verify your email by clicking the button below:</p>
        <a href="${verificationLink}" style="display:inline-block;padding:10px 20px;background-color:#28a745;color:white;text-decoration:none;border-radius:5px;">Verify Email</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    req.session.message = 'Verification email sent. Please check your inbox.';
    req.session.email = email; // ✅ Store email for verify-message page
    res.redirect('/verify-message');

  } catch (err) {
    console.error('Registration error:', err);
    res.render('signup', { error: 'An error occurred, please try again.' });
  }
};

// Handle email verification
exports.verifyEmail = async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.send('Invalid verification link.');
    }

    if (user.verified) {
      return res.send('Email already verified. You can log in.');
    }

    user.verified = true;
    await user.save();

    res.render('verify-success', { name: user.name });

  } catch (err) {
    console.error('Email verification error:', err);
    res.send('Verification link expired or invalid.');
  }
};

// Handle user login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Admin login
    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      req.session.isAdmin = true;
      req.session.user = { email, name: 'Admin' };
      return req.session.save(() => {
        res.redirect('/admin-dashboard');
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.render('login', { error: 'User not found' });
    }

    if (!user.verified) {
      return res.render('login', { error: 'Please verify your email before logging in.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.render('login', { error: 'Invalid credentials' });
    }

    const plainUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      course: user.course,
      year: user.year,
      isAdmin: false,
    };

    req.session.isAdmin = false;
    req.session.user = plainUser;
    req.session.save(() => {
      res.redirect('/book');
    });

  } catch (err) {
    console.error('Login error:', err);
    res.render('login', { error: 'An error occurred, please try again.' });
  }
};

// Handle logout
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/login');
  });
};

// Render forgot password page
exports.showForgotPassword = (req, res) => {
  res.render('forgot-password', { message: null });
};

// Handle forgot password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });

    // Always show the same message for security
    if (!user) {
      return res.render('forgot-password', { message: 'If this email exists, a reset link will be sent.' });
    }

    const resetToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const resetLink = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Sherubtse Ground Booking" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display:inline-block;padding:10px 20px;background-color:#6366f1;color:white;text-decoration:none;border-radius:5px;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    res.render('forgot-password', { message: 'If this email exists, a reset link will be sent.' });

  } catch (err) {
    console.error('Forgot password error:', err);
    res.render('forgot-password', { message: 'An error occurred, please try again.' });
  }
};

// Render reset password form
// Render reset password form
exports.showResetPassword = (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.send('Invalid or missing password reset token.');
  }

  console.log("Reset password page accessed with token:", token);

  // Render reset-password.ejs with the token and no message initially
  res.render('reset-password', { token, message: null });
};

// Handle reset password submission
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token) {
    return res.render('reset-password', { token: null, message: 'Missing token. Please try the reset link again.' });
  }

  if (!newPassword || newPassword.length < 6) {
    // Basic password validation, you can improve this as needed
    return res.render('reset-password', { token, message: 'Password must be at least 6 characters long.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return res.render('reset-password', { token: null, message: 'Invalid token or user does not exist.' });
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    console.log(`Password reset successful for user: ${user.email}`);

    // After successful reset, do not show token again
    res.render('reset-password', { token: null, message: 'Password reset successful. You can now log in with your new password.' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.render('reset-password', { token: null, message: 'Reset link expired or invalid.' });
  }
};
