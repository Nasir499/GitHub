import mongoose from "mongoose";
import { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const UserSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    repositories:[
        {
            type:Schema.Types.ObjectId,
            ref:"Repository"
        }
    ],
    followedUsers:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    starRepos:[
        {
            type:Schema.Types.ObjectId,
            ref:"Repository"
        }
    ],
},{
    timestamps:true,
    collection:"users"
})

// Hash password before saving
UserSchema.pre("save", async function(next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Strip password from JSON responses
UserSchema.set("toJSON", {
    transform: function(doc, ret) {
        delete ret.password;
        return ret;
    }
});

const User = mongoose.model("User", UserSchema)

export default User;