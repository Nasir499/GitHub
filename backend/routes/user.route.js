import express from 'express'
import { 
    getAllUsers,
    signUp,
    updateUserProfile,
    getUserProfile,
    deleteUserProfile,
    login}  from '../controllers/user.controller.js';


const userrouter = express.Router();


userrouter.get('/allUsers',getAllUsers)
userrouter.post('/signup',signUp)
userrouter.post('/login',login)
userrouter.get('/getProfile/:id',getUserProfile)
userrouter.put('/updateProfile/:id',updateUserProfile)
userrouter.delete('/deleteProfile/:id',deleteUserProfile)



export {userrouter}
