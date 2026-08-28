import express from 'express'
import authMiddleware from '../middlewares/auth.middleware.js'
import authorizeOwner from '../middlewares/authorize.middleware.js'
import { 
    createRepository,
    updateRepository,
    deleteRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoryForCurrentUser,
    toggleVisibilityById,
    fetchRepositoryS3Files,
    fetchS3FileContent,
    pushRepoFiles
} from '../controllers/repo.controller.js'

const repoRouter = express.Router();

// Public routes
repoRouter.get('/repo/all', getAllRepositories)
repoRouter.get('/repo/:id/s3-files', fetchRepositoryS3Files)
repoRouter.get('/repo/s3-content', fetchS3FileContent)
repoRouter.get('/repo/:id', fetchRepositoryById)
repoRouter.get('/repo/name/:name', fetchRepositoryByName)
repoRouter.get('/repo/user/:userId', fetchRepositoryForCurrentUser)
repoRouter.post('/repo/:id/push', pushRepoFiles)

// Protected routes
repoRouter.post('/repo/create', authMiddleware, createRepository)
repoRouter.put('/repo/update/:id', authMiddleware, authorizeOwner(), updateRepository)
repoRouter.delete('/repo/delete/:id', authMiddleware, authorizeOwner(), deleteRepository)
repoRouter.patch('/repo/toggle/:id', authMiddleware, authorizeOwner(), toggleVisibilityById)

export { repoRouter }
