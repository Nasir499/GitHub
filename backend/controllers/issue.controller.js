import mongoose from 'mongoose'
import Repository from '../models/repo.model.js'
import { MongoClient } from 'mongodb'
import User from '../models/user.model.js'
import Issue from '../models/issue.model.js'


const createIssue = async(req, res) => {
  const {title,description} = req.body;
  const id  = req.params.id;

try {
    const issue = new Issue({
      title,
      description,
      repository:id,
    })
    await issue.save();
  
    res.status(200).json({
      issue
    })
} catch (error) {
  console.error("Error during creating issue: ", error);
    res.status(500).json("Server Errors!!!")
}
};
const updateIssue = async(req, res) => {
  const id = req.params.id;
  const {title,description,status} =req.body;

  try {
    const issue = await Issue.findById(id);

    if(!issue){
      return res.status(404).json({error:"Issue not found"})
    }
    issue.title = title;
    issue.description = description;
    issue.status = status;

    await issue.save();
    res.json(issue)

  } catch (error) {
    console.error("Error during updating issue: ", error);
    res.status(500).json("Server Errors!!!")
  }
};
const deleteIssueById = async(req, res) => {
  const id = req.params.id;
  try{
   const issue = await Issue.findByIdAndDelete(id);

   if(!issue){
     return res.status(404).json({error:"Issue not found"})
   }
   res.json({message:"Issue deleted successfully"})
  }
   catch (error) {
    console.error("Error during deleting issue: ", error);
    res.status(500).json("Server Errors!!!")
  }
};
const getAllIssues = async(req, res) => {
   const id = req.params.id;
  try{
   const issues = await Issue.find({repository:id});

   if(!issues){
     return res.status(404).json({error:"Issue not found"})
   }
   res.json(issues)
  }
   catch (error) {
    console.error("Error during fetching issues : ", error);
    res.status(500).json("Server Errors!!!")
  }
};
const getIssueById = async(req, res) => {
    const id = req.params.id;
  try{
   const issue = await Issue.findById(id);

   if(!issue){
     return res.status(404).json({error:"Issue not found"})
   }
   res.json(issue)
  }
   catch (error) {
    console.error("Error during fetching issue : ", error);
    res.status(500).json("Server Errors!!!")
  }
};


export {
    createIssue,
    updateIssue,
    deleteIssueById,
    getAllIssues,
    getIssueById
}