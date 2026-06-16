import { db } from '../libs/dbConnect.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'; // ✅ FIXED

const collection = db.collection('users');


// ✅ GET USER
export const getUser = async (req, res, next) => {
  try {
    const query = { _id: new ObjectId(req.params.id) };
    const user = await collection.findOne(query);

    if (!user) {
      return next({ status: 404, message: 'User not found!' });
    }

    res.status(200).json(user);
  } catch (error) {
    next({ status: 500, error });
  }
};


// ✅ MAKE PREMIUM (AUTO LOGIN + DEBUG)
export const makePremium = async (req, res, next) => {
  try {
    console.log("🔥 API HIT /make-premium");
    console.log("📦 Body:", req.body);

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required ❌" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    console.log("🔍 Searching:", normalizedEmail);

    // ✅ Find user
    const user = await collection.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("❌ User not found");
      return res.status(404).json({ message: "User not found ❌" });
    }

    // ✅ Update user
    const result = await collection.updateOne(
      { email: normalizedEmail },
      {
        $set: {
          isPremium: true,
          trialEndsAt: null,
        },
      }
    );

    console.log("✅ DB Update:", result);

    // ✅ CREATE LOGIN TOKEN
    const token = jwt.sign(
      { id: user._id },
      process.env.AUTH_SECRET,
      { expiresIn: '7d' }
    );

    const { password, verificationToken, ...rest } = user;

    res
      .cookie('taskly_token', token, {
        httpOnly: true,
        secure: false, // change to true in production
        sameSite: 'lax',
      })
      .status(200)
      .json({
        message: "Premium activated 🎉",
        user: {
          ...rest,
          isPremium: true, // ✅ ensure frontend gets updated value
        },
      });

  } catch (error) {
    console.log("❌ ERROR:", error);
    next({ status: 500, error });
  }
};


// ✅ UPDATE USER
export const updateUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next({
      status: 401,
      message: 'You can only update your own account',
    });
  }

  try {
    if (req.body.password) {
      req.body.password = await bcrypt.hash(req.body.password, 10);
    }

    const query = { _id: new ObjectId(req.params.id) };

    const data = {
      $set: {
        ...req.body,
        updatedAt: new Date().toISOString(),
      },
    };

    const options = {
      returnDocument: 'after',
    };

    const updatedUser = await collection.findOneAndUpdate(
      query,
      data,
      options
    );

    if (!updatedUser) {
      return next({ status: 404, message: 'User not found' });
    }

    const { password: pass, ...rest } = updatedUser;

    res.status(200).json(rest);

  } catch (error) {
    next({ status: 500, error });
  }
};


// ✅ DELETE USER
export const deleteUser = async (req, res, next) => {
  if (req.user.id !== req.params.id) {
    return next({
      status: 401,
      message: 'You can only delete your own account',
    });
  }

  try {
    const query = { _id: new ObjectId(req.params.id) };

    const result = await collection.deleteOne(query);

    if (result.deletedCount === 0) {
      return next({ status: 404, message: 'User not found' });
    }

    res.status(200).json({ message: 'User has been deleted' });

  } catch (error) {
    next({ status: 500, error });
  }
};