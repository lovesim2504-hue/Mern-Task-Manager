import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

import userRouter from './routes/user.route.js';
import authRouter from './routes/auth.route.js';
import cldRouter from './routes/cloudinary.route.js';
import taskRouter from './routes/task.route.js';
import uploadRoutes from './routes/upload.routes.js';
import paymentRouter from './routes/payment.route.js';
import stripeRoutes from './routes/stripe.route.js';

import { errorHandler } from './libs/middleware.js';

const app = express();
const PORT = process.env.PORT || 8000;

//
// 🚨 1. STRIPE WEBHOOK (MUST BE FIRST)
//

app.use('undefined', express.raw({ type: 'application/json' }));

//
// ✅ 2. CORS
//
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
);

//
// ✅ 3. MIDDLEWARE
//
app.use(cookieParser());
app.use(express.json()); // JSON only

// ❌ REMOVED express-fileupload (THIS WAS BREAKING MULTER)

//
// ✅ 4. STATIC FILES (IMPORTANT FOR FILE ACCESS)
//
app.use('/uploads', express.static('uploads'));

  
// ✅ 5. ROUTES
//
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/image', cldRouter);
app.use('/api/v1/tasks', taskRouter);

// ✅ FIXED HERE
app.use('/api/v1/assignment', uploadRoutes);

app.use('/api/v1/payment', paymentRouter);
app.use('/api/stripe', stripeRoutes);

//
// ✅ 6. ROOT
//
app.get('/', (req, res) => {
  res.status(200).json({
    message: '🚀 Taskly API running successfully',
  });
});

//
// ❌ 7. 404 HANDLER
//
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found ❌',
  });
});

//
// ✅ 8. ERROR HANDLER
//
app.use(errorHandler);

//
// 🚀 9. START SERVER
//
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});