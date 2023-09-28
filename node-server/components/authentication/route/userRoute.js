const express = require('express');
const router = express.Router();
const {signUp, signIn, verifyEmail} = require('../controller/userController');
// const isUserEmailVerified = require('../../../middleware/signInMiddleWare');
require('dotenv').config();
const UserToken = require('../model/userTokenModel');


router.post('/signup',signUp);    
router.post('/signin',  signIn);
router.get('/:id/verify/:token',verifyEmail);
router.get('/token', async (req,res)=>{
    const user = await new UserToken({
        token:req.body.token
    }).save();
    res.send({user});
})
module.exports = router;