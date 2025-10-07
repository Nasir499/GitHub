import express from 'express'
import { 
    createRepository,
    updateRepository,
    deleteRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoryForCurrentUser,
    toggleVisibilityById } from '../controllers/repo.controller.js'

const repoRouter = express.Router();


repoRouter.post('/repo/create',createRepository)
repoRouter.get('/repo/all',getAllRepositories)
repoRouter.get('/repo/:id',fetchRepositoryById)
repoRouter.get('/repo/name/:name',fetchRepositoryByName)
repoRouter.get('/repo/user/:userId',fetchRepositoryForCurrentUser)
repoRouter.put('/repo/update/:id',updateRepository)
repoRouter.delete('/repo/delete/:id',deleteRepository)
repoRouter.patch('/repo/toggle/:id',toggleVisibilityById)


export {repoRouter}
