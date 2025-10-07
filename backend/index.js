import yargs  from "yargs";
import { hideBin } from 'yargs/helpers';
import { initRepo } from "./controllers/init.js";
import { addRepo } from "./controllers/add.js";
import { commitRepo } from "./controllers/commit.js";
import { pushRepo } from "./controllers/push.js";
import { pullRepo } from "./controllers/pull.js";
import { revertRepo } from "./controllers/revert.js";
import dotenv from 'dotenv'
import express from 'express'
import bodyParser from "body-parser";
import mongoose from "mongoose"; 
import { Server } from "socket.io";
import http from 'http'
import cors from 'cors'
import { mainrouter } from "./routes/main.route.js";

dotenv.config()

yargs(hideBin(process.argv))
    .command('start','Starts a new server',{},startServer)
    .command('init', 'Initialize the project', {}, initRepo)
    .command('add <file>', 'Add a new file', (yargs) => {
        yargs.positional('file', {
            describe: 'The file to add to staging area',
            type: 'string'
        })
    },
        (argv) => {
            addRepo(argv.file);
        })
    .command('commit <message>', 'Commit the staged files', (yargs) => {
        yargs.positional('message', {
            describe: 'The commit message',
            type: 'string'
        })
    },
        (argv) => {
            commitRepo(argv.message);
        })
    .command('push', 'Push commit to s3', {}, pushRepo)
    .command('pull', 'Pull latest changes from s3', {}, pullRepo)
    .command('revert <commitId>', 'Revert a specific commit', (yargs) => {
        yargs.positional('commitId', {
            describe: 'The commit ID to revert',
            type: 'string'
        })
    }, revertRepo)
    .demandCommand(1, 'You need at least one command before moving on').help().argv

    function startServer(){
        const app = express()
        const port = process.env.PORT || 8000;

        app.use(bodyParser.json());
        app.use(express.json())

        const mongoUrl = process.env.MONGODB_URI;

        mongoose
        .connect(mongoUrl)
        .then(()=>console.log("MongoDb Connected"))
        .catch((err)=>console.error(err));

       app.use(cors({origin:'*'}))

       app.use("/",mainrouter)
      
       let user = "test";
       const httpServer = http.createServer(app);
       const io = new Server(httpServer,{
        cors:{
            origin:"*",
            methods:["GET","POST"]
             }
         })
        
       io.on("connection",(socket)=>{
        socket.on("joinRoom",(userID)=>{
            user = userID;
            console.log("====");
            console.log(user);
            console.log("====");
            socket.join(user)
        });
       });

       const db = mongoose.connection;

       db.once("open",async()=>{
        console.log("CRUD operations called");        
       })

       httpServer.listen(port,()=>{
        console.log(`SERVER is running on : http://localhost:${port}`);  
       })
        
    }

