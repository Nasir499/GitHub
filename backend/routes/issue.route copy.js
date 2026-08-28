import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import authorizeIssueAuthor from '../middlewares/authorize-issue.middleware.js'
import {
    createIssue,
    updateIssue,
    deleteIssueById,
    getAllIssues,
    getIssueById
} from "../controllers/issue.controller.js"

const issueRouter = express.Router()

// Public routes
issueRouter.get('/issue/all/:repoId', getAllIssues)
issueRouter.get('/issue/:id', getIssueById)

// Protected routes
issueRouter.post('/issue/create/:repoId', authMiddleware, createIssue)
issueRouter.put('/issue/update/:id', authMiddleware, authorizeIssueAuthor(), updateIssue)
issueRouter.delete('/issue/delete/:id', authMiddleware, authorizeIssueAuthor(), deleteIssueById)

export { issueRouter }