import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { db } from '../libs/dbConnect.js';

const collection = db.collection('users');


// ✅ SIGNUP
export const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await collection.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return next({ status: 422, message: 'User already exists ❌' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const verifyLink = `${process.env.CLIENT_URL}/verify/${verificationToken}`;

    await collection.insertOne({
      username,
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      isVerified: false,
      isPremium: false,

      // ✅ TRIAL (change to 5 days later)
      trialEndsAt: new Date(Date.now() + 20 * 1000),

      verificationToken,
      createdAt: new Date(),
    });

    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Taskly" <no-reply@test.com>',
      to: email,
      subject: 'Verify your account',
      html: `<a href="${verifyLink}">Verify Account</a>`,
    });

    res.status(201).json({
      message: 'Signup successful. Check email to verify 📧',
    });

  } catch (err) {
    next(err);
  }
};



// ✅ VERIFY ACCOUNT
export const verifyAccount = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await collection.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({
        message: "Invalid or expired token ❌",
      });
    }

    await collection.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: "" },
      }
    );

    res.json({
      message: "Account verified successfully 🎉",
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



// ✅ SIGNIN
export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    const user = await collection.findOne({ email: normalizedEmail });

    if (!user) {
      return next({ status: 404, message: 'User not found ❌' });
    }

    if (!user.isVerified) {
      return next({
        status: 401,
        message: 'Please verify your email first 📧',
      });
    }

    // ✅ CHECK TRIAL
    const now = new Date();

    if (!user.isPremium && user.trialEndsAt && now > new Date(user.trialEndsAt)) {
      return next({
        status: 403,
        message: "Your free trial has expired. Please upgrade to premium 💳",
      });
    }

    // ✅ CHECK PASSWORD
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return next({ status: 401, message: 'Wrong password ❌' });
    }

    // ✅ CREATE TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.AUTH_SECRET,
      { expiresIn: '7d' }
    );

    const { password: pass, verificationToken, ...rest } = user;

    res
      .cookie('taskly_token', token, {
        httpOnly: true,
        secure: false, // true in production (HTTPS)
        sameSite: 'lax',
        path: '/', 
      })
      .status(200)
      .json(rest);
      

  } catch (err) {
    next(err);
  }
};



// ✅ SIGNOUT
export const signOut = (req, res) => {
  res.clearCookie('taskly_token');
  res.json({ message: 'Logged out ✅' });
};