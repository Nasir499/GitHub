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

// Specific / Static routes (MUST be defined before generic /repo/:id)
repoRouter.get('/repo/all', getAllRepositories)
repoRouter.get('/repo/s3-content', fetchS3FileContent)
repoRouter.get('/repo/name/:name', fetchRepositoryByName)
repoRouter.get('/repo/user/:userId', fetchRepositoryForCurrentUser)
repoRouter.post('/repo/create', authMiddleware, createRepository)

// Parameterized routes
repoRouter.get('/repo/:id/s3-files', fetchRepositoryS3Files)
repoRouter.post('/repo/:id/push', authMiddleware, authorizeOwner('id'), pushRepoFiles)
repoRouter.put('/repo/update/:id', authMiddleware, authorizeOwner(), updateRepository)
repoRouter.delete('/repo/delete/:id', authMiddleware, authorizeOwner(), deleteRepository)
repoRouter.patch('/repo/toggle/:id', authMiddleware, authorizeOwner(), toggleVisibilityById)

// Generic repo ID route (must come after specific routes)
repoRouter.get('/repo/:id', fetchRepositoryById)

export { repoRouter }
