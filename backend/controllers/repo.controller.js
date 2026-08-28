import Repository from '../models/repo.model.js'
import User from '../models/user.model.js'
import Issue from '../models/issue.model.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { s3, S3_BUCKET, ListObjectsV2Command, GetObjectCommand } from '../config/aws-config.js'

dotenv.config()

const createRepository = async (req, res) => {
    const { name, description, visibility } = req.body;
    const owner = req.user; // from auth middleware

    try {
        if (!name) {
            return res.status(400).json({ message: "Repository name is required" });
        }

        const newRepository = new Repository({
            name,
            description,
            owner,
            visibility: visibility !== undefined ? visibility : true
        });
        const result = await newRepository.save();

        await User.findByIdAndUpdate(owner, { $push: { repositories: result._id } });

        res.status(201).json({
            message: "Repository created",
            repository: result
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ message: "You already have a repository with this name" });
        }
        console.error("Error during creating repo:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const updateRepository = async (req, res) => {
    const id = req.params.id;
    const { content, description } = req.body;

    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        if (content) repository.content.push(content);
        if (description !== undefined) repository.description = description;

        const updatedRepo = await repository.save();

        res.json({
            message: "Repository updated successfully",
            repository: updatedRepo
        });
    } catch (error) {
        console.error("Error during updating repo:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const deleteRepository = async (req, res) => {
    const id = req.params.id;

    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        await Issue.deleteMany({ repository: id });
        await User.findByIdAndUpdate(repository.owner, { $pull: { repositories: id } });
        await Repository.findByIdAndDelete(id);

        res.json({ message: "Repository deleted successfully" });
    } catch (error) {
        console.error("Error during deleting repo:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const getAllRepositories = async (req, res) => {
    try {
        const repositories = await Repository.find({ visibility: true }).populate("owner").populate("issues");
        res.json(repositories);
    } catch (error) {
        console.error("Error during fetching all repos:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const fetchRepositoryById = async (req, res) => {
    const repoId = req.params.id;
    try {
        const repository = await Repository.findById(repoId).populate("owner").populate("issues");
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }
        
        if (!repository.visibility) {
            const authHeader = req.headers.authorization;
            if (!authHeader) {
                return res.status(404).json({ message: "Repository not found" });
            }
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
                if (repository.owner._id.toString() !== decoded.id) {
                    return res.status(404).json({ message: "Repository not found" });
                }
            } catch (err) {
                return res.status(404).json({ message: "Repository not found" });
            }
        }

        res.json(repository);
    } catch (error) {
        console.error("Error during fetching repo:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const fetchRepositoryByName = async (req, res) => {
    const repoName = req.params.name;
    try {
        const repository = await Repository.findOne({ name: repoName }).populate("owner").populate("issues");
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }
        res.json(repository);
    } catch (error) {
        console.error("Error during fetching repo by name:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const fetchRepositoryForCurrentUser = async (req, res) => {
    const userId = req.params.userId;
    try {
        const repositories = await Repository.find({ owner: userId });

        res.json({
            message: "Repositories found",
            repositories
        });
    } catch (error) {
        console.error("Error during fetching repo by user:", error);
        res.status(500).json({ message: "Server error" });
    }
};

const toggleVisibilityById = async (req, res) => {
    const id = req.params.id;

    try {
        const repository = await Repository.findById(id);
        if (!repository) {
            return res.status(404).json({ message: "Repository not found" });
        }

        repository.visibility = !repository.visibility;
        const updatedRepo = await repository.save();

        res.json({
            message: "Repository visibility toggled successfully",
            repository: updatedRepo
        });
    } catch (error) {
        console.error("Error during toggling repo visibility:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Fetch pushed files from S3 bucket
const fetchRepositoryS3Files = async (req, res) => {
    try {
        const command = new ListObjectsV2Command({
            Bucket: S3_BUCKET,
            Prefix: "commits/"
        });
        const data = await s3.send(command);

        if (!data.Contents || data.Contents.length === 0) {
            return res.json({ files: [] });
        }

        const files = data.Contents
            .filter(item => !item.Key.endsWith('commit.json') && !item.Key.endsWith('/'))
            .map(item => {
                const parts = item.Key.split('/');
                const commitId = parts[1] || '';
                const fileName = parts.slice(2).join('/') || parts[parts.length - 1];
                return {
                    key: item.Key,
                    name: fileName,
                    commitId,
                    size: item.Size,
                    lastModified: item.LastModified
                };
            });

        res.json({ files });
    } catch (error) {
        console.error("Error fetching S3 files:", error);
        res.status(500).json({ message: "Failed to fetch S3 files", error: error.message });
    }
};

// Fetch single file content from S3
const fetchS3FileContent = async (req, res) => {
    const key = req.query.key;
    if (!key) {
        return res.status(400).json({ message: "Key parameter is required" });
    }

    try {
        const command = new GetObjectCommand({
            Bucket: S3_BUCKET,
            Key: key
        });
        const response = await s3.send(command);
        const streamToText = async (stream) => {
            const chunks = [];
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            return Buffer.concat(chunks).toString('utf-8');
        };
        const content = await streamToText(response.Body);

        res.json({ key, content });
    } catch (error) {
        console.error("Error fetching S3 file content:", error);
        res.status(500).json({ message: "Failed to fetch file content", error: error.message });
    }
};

export {
    createRepository,
    updateRepository,
    deleteRepository,
    getAllRepositories,
    fetchRepositoryById,
    fetchRepositoryByName,
    fetchRepositoryForCurrentUser,
    toggleVisibilityById,
    fetchRepositoryS3Files,
    fetchS3FileContent
}
