const JWT = require('jsonwebtoken')

const createToken = {
    activation : (payload)=>{
        return JWT.sign(payload,process.env.ACTIVATION_TOKEN,{expiresIn:"5m"})
    },
    refresh : (payload)=>{
        return JWT.sign(payload,process.env.REFRESH_TOKEN,{expiresIn:"24h"})
    },
    access : (payload)=>{
        return JWT.sign(payload,process.env.ACCESS_TOKEN,{expiresIn:"15m"})
    }
}

module.exports = createToken