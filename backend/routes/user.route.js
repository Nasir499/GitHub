import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import { 
    getAllUsers,
    signUp,
    updateUserProfile,
    getUserProfile,
    deleteUserProfile,
    login,
    getUserActivity,
    toggleFollowUser
} from '../controllers/user.controller.js';

const userrouter = express.Router();

// Self-only middleware: ensures user can only modify their own profile
const selfOnly = (req, res, next) => {
    if (req.user !== req.params.id) {
        return res.status(403).json({ message: 'Access denied. You can only modify your own profile.' });
    }
    next();
};

// Public routes
userrouter.get('/allUsers', getAllUsers)
userrouter.post('/signup', signUp)
userrouter.post('/login', login)
userrouter.get('/user/activity/:userId', getUserActivity)

// Protected routes
userrouter.get('/getProfile/:id', authMiddleware, getUserProfile)
userrouter.post('/user/follow/:id', authMiddleware, toggleFollowUser)
userrouter.put('/updateProfile/:id', authMiddleware, selfOnly, updateUserProfile)
userrouter.delete('/deleteProfile/:id', authMiddleware, selfOnly, deleteUserProfile)

export { userrouter }
