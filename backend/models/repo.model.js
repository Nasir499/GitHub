import mongoose from "mongoose";
import { Schema } from "mongoose";


const RepositorySchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String
    },
    content: [
        {
        type: String,
        }
    ],
    visibility:{
        type:Boolean
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    issues:[
        {
            type:Schema.Types.ObjectId,
            ref:"Issue"
        }
    ]
},{timestamps:true},{Collection:"repos"})


const Repository = mongoose.model("Repository",RepositorySchema)

export default Repository;
