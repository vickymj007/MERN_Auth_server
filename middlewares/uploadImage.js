const multer = require('multer')

const storage = multer.diskStorage({
    //destination
    destination: function(req,res,cb){
        cb(null,'./uploads')
    },
    //filename
    fileName: function(req,file,cb){
        cb(null,file.fieldname + "-" + Date.now() + file.originalname)
    }
})

const fileFilter = (req,file,cb)=>{
    cb(null,true)
}

let upload = multer({
    storage,
    fileFilter
})

module.exports = upload.single('avatar')