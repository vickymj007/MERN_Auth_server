const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const express = require('express')
const userRoutes = require('./routes/userRoutes')
const uploadRoutes = require('./routes/uploadRoutes')
const app = express()
const cors = require('cors')
require('dotenv').config()

//cors options
const corsOptions = {
    origin: true, 
    credentials: true, 
};

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cors(corsOptions))
app.use(cookieParser())
app.use('/uploads', express.static('uploads'))

// routes
app.use('/api',userRoutes)
app.use('/api',uploadRoutes)

app.get('/',(req,res)=>{
    res.status(200).json({
        msg:"Welcome to MERN Authentication API"})
})


//db
const connectDB = async ()=>{
    try {
        await mongoose.connect(process.env.MONGO_URL)
        app.listen(process.env.PORT,()=>{
            console.log("Connected to MongoDB");
            console.log("Server is running");
        })
    } catch (error) {
        console.log({msg:"Unable to connect MongoDB",err_msg:error.message});
    }
}
connectDB()
//middleware

