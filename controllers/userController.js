const bcryptjs = require('bcryptjs')
const validateEmail = require('../helpers/validateEmail')
const User = require('../models/userModel')
const createToken = require('../helpers/createToken')
const sendMail = require('../helpers/sendMail')
const JWT = require('jsonwebtoken')
const {google} = require('googleapis')
const {OAuth2} = google.auth
require('dotenv').config()

const userControllers = {
    register : async(req,res)=>{
        try {
            //get info
            const {name,email,password} = req.body

            //check fields
            if(!name || !email || !password) return res.status(400).json({msg:"Please fill in all the fields"})

            //check format
            if(!validateEmail(email)) return res.status(400).json({msg:"Please enter a valid email"})

            //check user
            const user = await User.findOne({email})
            if(user) return res.status(400).json({msg:"Email already exist in the system"})
            
            //check password
            if(password.length < 6 ) return res.status(400).json({msg:"Password should be more than 6 characters"})
            
            //hash password
            const salt = await bcryptjs.genSalt(10)
            const hashedPassword = await bcryptjs.hash(password, salt)

            //create token
            const activation_token = createToken.activation({name,email,password:hashedPassword})

            //send mail
            const url = `${process.env.URL}/api/auth/activate/${activation_token}`
            sendMail.sendEmailRegister(email,url,"Verify your email")

            //registration success
            res.status(200).json({msg:"Welcome! Please check your email"})

        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
    activate : async (req,res)=>{
        try {
            //get token
            const {activation_token} = req.body
            
            //verify token
            const user = JWT.verify(activation_token, process.env.ACTIVATION_TOKEN)

            //check user
            const checkUser = await User.findOne({email:user.email})
            if(checkUser) return res.status(400).json({msg:"This email is already registered"})

            //add new user
            await User.create(user)
            res.status(201).json({msg:"User account has been activated, You can now sign in"})

        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
    signin : async (req,res)=>{
        try {
            //get credentials
            const {email,password} = req.body

            //check email
            const user = await User.findOne({email})
            if(!user) return res.status(400).json({msg:"This email is not registered in our system"})

            //check password
            const isValid = await bcryptjs.compare(password, user.password)
            if(!isValid) return res.status(400).json({msg:"Password is incorrect"})

            //refresh token
            const refreshToken = createToken.refresh({id:user._id})
            res.cookie("_apprftoken", refreshToken,{
                httpOnly:true,
                path:"api/auth/access",
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            })

            //signin success
            res.status(201).json({msg:"Signin success"})

        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
    access : async (req,res)=>{
        try {
            //refresh token
            const refreshToken = req.cookies._apprftoken
            if(!refreshToken) return res.status(401).json({msg:"Please sign in."})

            //validate
            JWT.verify(refreshToken,process.env.REFRESH_TOKEN,(err,user)=>{
                if(err) return res.status(400).json({msg:"Please sign in again."})
                
                //create access token
                const accessToken = createToken.access({id:user.id})
                res.status(200).json({accessToken})
            })

        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
    forgot : async (req,res)=>{
        try {
            //get email
            const {email} = req.body

            //check email
            const user = await User.findOne({email})
            if(!user) return res.status(400).json({msg:"This email is not registered in our system"})

            //create access token
            const accessToken  = createToken.access({id:user._id})

            //send email
            const url = `${process.env.URL}/auth/reset-password/${accessToken}`
            sendMail.sendEmailReset(email,url,"Reset your password",user.name)

            //success
            res.status(200).json({msg:"Please check your email"})
            
        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
    reset : async (req,res)=>{
        try {
            //get password
            const {password} = req.body

            //hash password
            const salt = await bcryptjs.genSalt(10)
            const hashedPassword = await bcryptjs.hash(password, salt)

            //update password
            await User.findOneAndUpdate({_id:req.user.id},{password:hashedPassword})

            //reset success
            res.status(200).json({msg:"Password was updated successfully"})

        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
    info : async (req,res)=>{
        try {
            //get info -password
            const user = await User.findById(req.user.id).select("-password")

            //reset success
            res.status(200).json(user)

        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
    update : async (req,res)=>{
        try {
            //get info
            const {name,avatar} = req.body

            //update
            await User.findOneAndUpdate({_id:req.user.id},{name,avatar})
            
            //success
            res.status(200).json({msg:"Update Success"})

        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
    signout : async (req,res)=>{
        try {
            //clear cookie
            res.clearCookie("_apprftoken",{path:"api/auth/access"})
            
            //success
            res.status(200).json({msg:"Signout Success"})

        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    },
    google : async (req,res)=>{
        try {
            //get tokenId
            const {tokenId }= req.body

            //verify tokenId
            const client = new OAuth2(process.env.G_CLIENT_ID)
            const verify = await client.verifyIdToken({
                idToken:tokenId,
                audience: process.env.G_CLIENT_ID
            })

            //get data
            const {email_verified, email, name, picture} = verify.getPayload

            //failed verification
            if(!email_verified) return res.status(400).json({msg:"Email verification failed"})

            //passed verification
            const user = await User.findOne({email})
            if(user){
                //if user exist => signin
                const refreshToken = createToken.refresh()
                res.cookie("_apprftoken", refreshToken, {
                    httpOnly:true,
                    maxAge: 24 * 60 * 60 * 1000, // 24h
                    path:"/api/auth/access" 
                })
                
                //success
                res.status(200).json({msg:"Signin with google success"})
            }else {
                //if new user => create user
                const password = email + process.env.G_CLIENT_ID
                const salt = await bcryptjs.genSalt(10)
                const hashedPassword = await bcryptjs.hash(password, salt)

                await User.create({
                    name,
                    email,
                    password:hashedPassword,
                    avatar:picture
                })

                const refreshToken = createToken.refresh()
                res.cookie("_apprftoken",refreshToken,{
                    httpOnly:true,
                    path:"/api/auth/access",
                    maxAge: 24 * 60 * 60 * 1000 //24h
                })

                //success
                res.status(200).json({msg:"Signin with google success"})
            }

        } catch (error) {
            res.status(500).json({msg:error.message})
        }
    }
    
} 

module.exports = userControllers