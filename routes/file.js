const router = require('express').Router();
const multer = require('multer')
const path = require('path')
require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const File = require('../models/file');
const sendMail = require('../services/emailService');
const emailTemp = require('../services/emailTemp');
let storage = multer.diskStorage({
    destination : (req,file,cb) => cb(null,'uploads/'),
    filename : (req,file,cb) => {
        const uniqueName = `${Date.now()}-${Math.random(Math.random()*1E9)}${path.extname(file.originalname)}`; 
        cb(null,uniqueName);
    }

})

let upload = multer({
        storage,
        limit : {
            fileSize : 100000000
        }

}).single('myfile');

router.post('/',(req,res)=>{
    
    

    // Store file
        upload(req,res,async(err) => {
           // Validate Request
            if(!req.file){
                return res.json({
                    error : "All Filed Are Require!"
                })
            }
            if(err){
                return res.status(500).send({
                    error : err.message
                })
            }
            // Store into Database
            const file = new File({
                filename : req.file.filename,
                uuid : uuidv4(),
                path : req.file.path,
                size : req.file.size
            })

            const response = await file.save();
            return res.json({
                file : `${process.env.APP_BASE_URL}files/${response .uuid}`
            })

        })
    

    // Respomse -> Link
})

router.post('/send', async (req, res) => {
    const { uuid, emailTo, emailFrom, expiresIn } = req.body;
    if(!uuid || !emailTo || !emailFrom) {
        return res.status(422).send({ error: 'All fields are required except expiry.'});
    }
    // Get data from db 
    try {
      const file = await File.findOne({ uuid: uuid });
      if(file.sender) {
        return res.status(422).send({ error: 'Email already sent once.'});
      }
      file.sender = emailFrom;
      file.receiver = emailTo;
      const response = await file.save();
      // send mail
      const sendMail = require('../services/emailService');
      sendMail({
        from: emailFrom,
        to: emailTo,
        subject: 'DoTransfer file sharing',
        text: `${emailFrom} shared a file with you.`,
        html: require('../services/emailTemp')({
                  emailFrom, 
                  downloadLink: `${process.env.APP_BASE_URL}files/${file.uuid}?source=email` ,
                  size: parseInt(file.size/1000) + ' KB',
                  expires: '24 hours'
              })
      }).then(() => {
        return res.json({success: true});
      }).catch(err => {
        return res.status(500).json({error: 'Error in email sending.'});
      });
  } catch(err) {
    return res.status(500).send({ error: 'Something went wrong.'});
  }
  
  });
  
  module.exports = router;