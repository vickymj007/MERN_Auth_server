const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        trim:true
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        trim:true
    },
    password:{
        type:String,
        required:[true,"Please enter password"],
        min: 6
    },
    avatar:{
        type:String,
        default:"https://res.cloudinary.com/dv3upziqo/image/upload/v1692557842/Avatar/profile-icon_mxvuwf.png"
    },
},{timestamp:true});


const User = mongoose.model("User",userSchema);
module.exports = User;