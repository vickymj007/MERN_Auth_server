const nodemailer = require('nodemailer')
const {google} = require('googleapis')
const {OAuth2} = google.auth
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground"
require('dotenv').config()

const {G_CLIENT_ID, G_CLIENT_SECRET, G_REFRESH_TOKEN, ADMIN_EMAIL} = process.env

const oauth2client = new OAuth2(
    G_CLIENT_ID,
    G_CLIENT_SECRET,
    G_REFRESH_TOKEN,
    OAUTH_PLAYGROUND
)

const sendEmailRegister = (to,url,text)=>{
    oauth2client.setCredentials(
        {refresh_token:G_REFRESH_TOKEN}
    )
    const accessToken = oauth2client.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        service:"gmail",
        auth:{
            type:"OAuth2",
            user:ADMIN_EMAIL,
            clientId:G_CLIENT_ID,
            clientSecret:G_CLIENT_SECRET,
            refreshToken:G_REFRESH_TOKEN,
            accessToken
        }
    })

    const mailOptions = {
        from:ADMIN_EMAIL,
        to,
        subject:"Activate your account",
        html:`
        <body>
            <style>
            .wrapper h1 span{
                color: #ffb703;
                font-family: sans-serif;
            }
            .wrapper button{
                padding: 8px 28px;
                font-weight:bold;
                border: none;
                outline: none;
                background-color: #ffb703;
                border-radius: 8px;
                margin: 10px auto;
            }
        </style>
            <div class="wrapper">
                <div class="card">
                    <h1><span>Welcome!</span> and thank you for registering</h1>
                    <p>Please validate your email by clicking the button below 🙂</p>
                    <a href=${url}><button>${text}</button></a>
                    <p class="spacing">
                        If the button above does not work, please navigate to the link provided below 👇
                    </p>
                    <div>${url}</div>
                </div>
            </div>
        </body>
        `
    }

    smtpTransport.sendMail(mailOptions,(err,info)=>{
        if(err) return err
        return info
    })
}

const sendEmailReset = (to,url,text,name)=>{
    oauth2client.setCredentials(
        {refresh_token:G_REFRESH_TOKEN}
    )
    const accessToken = oauth2client.getAccessToken()
    const smtpTransport = nodemailer.createTransport({
        service:"gmail",
        auth:{
            type:"OAuth2",
            user:ADMIN_EMAIL,
            clientId:G_CLIENT_ID,
            clientSecret:G_CLIENT_SECRET,
            refreshToken:G_REFRESH_TOKEN,
            accessToken
        }
    })

    const mailOptions = {
        from:ADMIN_EMAIL,
        to,
        subject:"Reset password",
        html:`
        <body>
            <style>
            .wrapper h1 span{
                color: #ffb703;
                font-family: sans-serif;
            }
            .wrapper button{
                padding: 8px 28px;
                font-weight:bold;
                border: none;
                outline: none;
                background-color: #ffb703;
                border-radius: 8px;
                margin: 10px auto;
            }
        </style>
            <div class="wrapper">
                <div class="card">
                    <h1><span>Hey</span> ${name}</h1>
                    <p>Please click the button below to reset your password 🙂</p>
                    <a href=${url}><button>${text}</button></a>
                    <p class="spacing">
                        If the button above does not work, please navigate to the link provided below 👇
                    </p>
                    <div>${url}</div>
                </div>
            </div>
        </body>
        `
    }

    smtpTransport.sendMail(mailOptions,(err,info)=>{
        if(err) return err
        return info
    })
}

module.exports = {sendEmailRegister,sendEmailReset}