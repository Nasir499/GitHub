import mongoose from 'mongoose'
import Repository from '../models/repo.model.js'
import { MongoClient } from 'mongodb'
import User from '../models/user.model.js'
import Issue from '../models/issue.model.js'



const createRepository = async (req, res) => {
  const { owner, name, issues, content, description, visibility } = req.body;

  try {
     if(!name){
      return res.status(400).json({error:"Repository name is required"})
    }
    if(!mongoose.Types.ObjectId.isValid(owner)){
      return res.status(400).json({error:"Repository owner is required"})
    }
    // if(!mongoose.Types.ObjectId.isValid(issues)){
    //   return res.status(400).json({error:"Repository owner is required"})
    // }

    const newRepository = new Repository({
      name,
      description,
      owner,
      issues,
      content,
      visibility
    })
    const result = await newRepository.save();

    res.status(201).json({
      message:"Repository created",
      repositoryId:result._id,
    })

  } catch (error) {
    console.error("Error during creating repo : ", error);
    res.status(500).json("Server Errors!!!")
  }
};
const updateRepository = async (req, res) => {
  const id = req.params.id;
  const {content,description} = req.body;


  try {
    const repository = await Repository.findById(id);
    if(!repository){
      return res.status(404).json({error:"Repo not found"})
    }

    repository.content.push(content);
    repository.description = description

    const updatedRepo = await repository.save();

    res.json({
      message:"Repo updated successfully",
      repository:updatedRepo
    })
  } catch (error) {
    console.error("Error during updating repo by name: ", error);
    res.status(500).json("Server Errors!!!")
  }
};
const deleteRepository = async (req, res) => {
  const id = req.params.id;
 

  try {
    const repository = await Repository.findByIdAndDelete(id);
    if(!repository){
      return res.status(404).json({error:"Repo not found"})
    }


    res.json({
      message:"Repo deleted successfully",
      
    })
  } catch (error) {
    console.error("Error during deleting repo by name: ", error);
    res.status(500).json("Server Errors!!!")
  }
};
const getAllRepositories = async (req, res) => {
  try {
    const repositories = await Repository.find({}).populate("owner").populate("issues");
    res.send(repositories)
  } catch (error) {
    console.error("Error during fetching all repo : ", error);
    res.status(500).json("Server Errors!!!")
  }
};
const fetchRepositoryById = async (req, res) => {
  const repoId = req.params.id
   try {
    const repository = await Repository.find({_id:repoId}).populate("owner").populate("issues")
     res.json(repository)
   } catch (error) {
     console.error("Error during fetching repo : ", error);
    res.status(500).json("Server Errors!!!")
   }

};
const fetchRepositoryByName = async (req, res) => {
   const repoName = req.params.name
   try {
    const repository = await Repository.find({name:repoName}).populate("owner").populate("issues")
     res.json(repository)
   } catch (error) {
     console.error("Error during fetching repo by name: ", error);
    res.status(500).json("Server Errors!!!")
   }

};
const fetchRepositoryForCurrentUser = async (req, res) => {
  const userId = req.user;
  try {
    const repositories = await Repository.find({owner:userId})

    if(!repositories || repositories.length == 0){
      return res.status(404).json({error:"User repo not found"})
    }

    res.json({
      message:"REPO found",
      repositories
    })
  } catch (error) {
    console.error("Error during fetching repo by user : ", error);
    res.status(500).json("Server Errors!!!")
  }
};
const toggleVisibilityById = async (req, res) => {
   const id = req.params.id;

  try {
    const repository = await Repository.findById(id);
    if(!repository){
      return res.status(404).json({error:"Repo not found"})
    }

    repository.visibility = !repository.visibility;
    const updatedRepo = await repository.save();

    res.json({
      message:"Repo visibility toggeled successfully",
      repository:updatedRepo
    })
  } catch (error) {
    console.error("Error during toggling repo by name: ", error);
    res.status(500).json("Server Errors!!!")
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
  toggleVisibilityById
}
