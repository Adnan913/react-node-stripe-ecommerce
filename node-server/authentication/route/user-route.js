const express = require('express');
const router = express.Router();
const {signUp, signIn, verifyEmail} = require('../controller/userController');
require('dotenv').config();


router.post('/signup',signUp);    
router.post('/signin', signIn);
router.get('/:id/verify/:token',verifyEmail);

module.exports = router;