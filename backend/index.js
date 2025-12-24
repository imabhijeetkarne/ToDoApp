// Import required modules
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();
import connectDB from './config/db.js';
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth.route.js"

let PORT = process.env.PORT || 8000;


// Initialize Express app
let app = express();

// Middleware
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));

// Use routes
app.use('/api/auth', authRouter);

// Start the server
app.listen(PORT, () => {
    connectDB();
    console.log(`Server is running on port ${PORT}`);
});