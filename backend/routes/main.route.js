import express from 'express'
import { userrouter } from './user.route.js';
import { repoRouter } from './repo.route.js';
import { issueRouter } from './issue.route.js';




const mainrouter = express.Router();


mainrouter.use(userrouter)
mainrouter.use(repoRouter)
mainrouter.use(issueRouter)


mainrouter.get('/',(req,res)=>{
        res.send("HELLO")
})

export {mainrouter}

    
