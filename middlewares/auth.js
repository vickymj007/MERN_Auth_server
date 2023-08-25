const JWT = require('jsonwebtoken')

const auth = (req,res,next)=>{
    try {
        //check access token
        const token = req.header("Authorization")
        if(!token) return res.status(400).json({msg:"Authentication failed"})

        //validate token
        JWT.verify(token, process.env.ACCESS_TOKEN, (err,user)=>{
            if(err) return res.status(400).json({msg:"Authentication failed"})

            //success
            req.user = user
            next()
        })
    } catch (error) {
        res.status(500).json({msg:error.message})
    }
}

module.exports = auth;