import mongoose from "mongoose";
import { Schema } from "mongoose";

const UserSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    repositories:[
        {
            type:Schema.Types.ObjectId,
            ref:"Repository",
            default:[]
        }
    ],
    followedUsers:[
        {
            type:Schema.Types.ObjectId,
            ref:"Users",
            default:[]
        }
    ],
    starRepos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Repository",
            default:[]
        }
    ],
},{
    timestamps:true
},{Collection:"users"})

const User = mongoose.model("User",UserSchema)

export default User;