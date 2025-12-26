// auth.js
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';

export const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies
    if (req.cookies?.token) {
        token = req.cookies.token;
    } 
    // Check for token in Authorization header
    else if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Not authorized, no token found' 
        });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from the token
        const user = await User.findById(decoded.userId).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('JWT Error:', error.message);
        return res.status(401).json({ 
            success: false,
            message: 'Not authorized, token failed',
            error: error.name === 'JsonWebTokenError' ? 'Invalid token' : error.message
        });
    }
};