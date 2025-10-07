import express from 'express'
import {
    createIssue,
    updateIssue,
    deleteIssueById,
    getAllIssues,
    getIssueById
   } from "../controllers/issue.controller.js"


const issueRouter = express.Router()

issueRouter.post('/issue/create',createIssue)
issueRouter.get('/issue/all',getAllIssues)
issueRouter.get('/issue/:id',getIssueById)
issueRouter.put('/issue/update/:id',updateIssue)
issueRouter.delete('/issue/delete/:id',deleteIssueById)

export{
    issueRouter
}