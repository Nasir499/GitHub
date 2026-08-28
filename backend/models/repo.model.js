import mongoose from "mongoose";
import { Schema } from "mongoose";


const RepositorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    content: [
        {
            type: String,
        }
    ],
    visibility:{
        type:Boolean,
        default:true
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
},{
    timestamps:true,
    collection:"repos"
})

// Compound unique index: same user can't have two repos with same name
RepositorySchema.index({ name: 1, owner: 1 }, { unique: true });

const Repository = mongoose.model("Repository",RepositorySchema)

export default Repository;
