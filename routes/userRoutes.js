const express = require('express')
const userRoutes = express.Router()
const userControllers = require('../controllers/userController')
const auth = require("../middlewares/auth")

userRoutes.post('/auth/register',userControllers.register)
userRoutes.post('/auth/activation',userControllers.activate)
userRoutes.post('/auth/signin',userControllers.signin)
userRoutes.post('/auth/access',userControllers.access)
userRoutes.post('/auth/forgot_pass',userControllers.forgot)
userRoutes.post('/auth/reset_pass', auth, userControllers.reset)
userRoutes.get('/auth/user', auth, userControllers.info)
userRoutes.patch('/auth/user_update', auth, userControllers.update)
userRoutes.get('/auth/signout', userControllers.signout)
userRoutes.post('/auth/google_signin', userControllers.google)


module.exports = userRoutes;