import mongoose from "mongoose";
import { Schema } from "mongoose";

const IssueSchema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    status:{
        type:String,
        enum:["open","closed"],
        default:"open"
    },
    repository:{
        type:Schema.Types.ObjectId,
        ref:"Repository",
        required:true
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},{
    timestamps:true,
    collection:"issues"
})


const Issue = mongoose.model("Issue",IssueSchema)

export default Issue;