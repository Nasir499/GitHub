import jwt from 'jsonwebtoken'
import { MongoClient } from 'mongodb'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'

dotenv.config()
const mongodbUri = process.env.MONGODB_URI;

let client;

async function connectClient() {
    if (!client) {
        client = new MongoClient(mongodbUri,
            {
                useNewUrlParser: true,
                useUnifiedTopology: true
            }
        )
        await client.connect()
    }
}
const getAllUsers = async(req, res) => {
   try {
        await connectClient()
        const db = client.db("Github")
        const userCollection = db.collection("users")

        const users = await userCollection.find({}).toArray();
        res.json(users)
   } catch (error) {
       console.error("Error during fetching : ",error);
        res.status(500).json("Server Errors!!!")
   }
};
const signUp = async (req, res) => {
    const { username, password, email } = req.body;
    try {
        await connectClient();
        const db = client.db("Github")
        const userCollection = db.collection("users")


        const user = await userCollection.findOne({ username })
        if (user) {
            return res.status(400).json({ message: "User already exists" })
        }


        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = {
            username,
            password: hashedPassword,
            email,
            repositories: [],
            followedUsers: [],
            starRepos: []
        }

        const result = await userCollection.insertOne(newUser);

        const token = jwt.sign({ id: result.insertId }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })

        res.json({ token })



    } catch (error) {
        console.error("Error during signUp : ", error.message);
        res.status(500).send("Server error")

    }
};
const getUserProfile = async(req, res) => {
    const currentId = req.params.id;

    try {
        await connectClient()
        const db = client.db("Github")
        const userCollection = db.collection("users")

        const user = await userCollection.findOne({_id:new ObjectId(currentId)});
         if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }
        res.json(user)
    } catch (error) {
         console.error("Error during fetching : ",error);
        res.status(500).json("Server Errors!!!")
    }
};
const updateUserProfile =async(req, res) => {
   const currentId = req.params.id;
   const {email,password} =req.body;


   try {
    let upadateFields = {email}
    if(password){
        const salt = await bcrypt.genSalt(12)
        const hashedPassword = await bcrypt.hash(password,salt)
        upadateFields.password = hashedPassword
    }
     await connectClient()
        const db = client.db("Github")
        const userCollection = db.collection("users")
        const result = await userCollection.findOneAndUpdate(
        {
            _id:new ObjectId(currentId)
        },
        {$set:upadateFields},
        {ReturnDocument:"after"})

        if(!result.value){
             return res.status(400).json({ message: "User not found" })

        }
        res.send(result.value)

   } catch (error) {
     console.error("Error during updating : ",error);
        res.status(500).json("Server Errors!!!")
   }
};
const deleteUserProfile = async(req, res) => {
    const currentId = req.params.id;

    try {
        await connectClient()
        const db = client.db("Github")
        const userCollection = db.collection("users")

        const result = await userCollection.deleteOne({
            _id:new ObjectId(currentId)
        })
        if(result.deleteCount==0){
             return res.status(400).json({ message: "User not found" })
       }
       res.json({message:"User Deleted"})
        
    } catch (error) {
         console.error("Error during deleting : ",error);
        res.status(500).json("Server Errors!!!")
    }
};
const login = async(req, res) => {
    const {email,password} = req.body;


    try {
        await connectClient()
        const db = client.db("Github")
        const userCollection = db.collection("users")

        const user = await userCollection.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: "Invalid Credentials" })
        }

        const isMatch = bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(400).json({ message: "Invalid Credentials" })
        }

       const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "1h" })

       res.json({token,userId:user._id})


    } catch (error) {
        console.error("Error during login : ",error);
        res.status(500).json("Server Errors!!!")
        
    }
};



export {
    getAllUsers,
    signUp,
    updateUserProfile,
    getUserProfile,
    deleteUserProfile,
    login
}

