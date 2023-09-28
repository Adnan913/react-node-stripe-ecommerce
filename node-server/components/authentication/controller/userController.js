require('dotenv').config();
const nodemailer = require('nodemailer');
const User = require('../model/userModel');
const UserEmailVerification = require('../model/userEmailVerificationModel');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const UserToken = require('../model/userTokenModel');

const signUp = async (req, res) =>{
    try{
        let {email , password, phone, role} = req.body;
        email = email.trim();
        password = password.trim();
        phone = phone.trim();
        role = role.trim();
        
        if(email == "" || password == "" || phone =="" || role == ""){
            res.status(403).send({
                status: "Failed", message: "Empty input fields"
            });
        }
        let user = await User.find({email});
        
        if(user){
            return res.status(400).send({
                status: "Failed", message: "User already exist!"
            });
            
        }else{
            const hashedPassword =await bcrypt.hash(password,10);
            const newUser = await new User({
                    email, password: hashedPassword,role, phone
            }).save();

            const verification = await new  UserEmailVerification({
                userId: newUser._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();

            const url = `${process.env.BASE_URL}/user/${newUser._id}/verify/${verification.token}`;
            await sendEmailVerification(newUser.email,"Verify Email", url);

            res.send({
                status: "Success", is_verified: false,  message: "email sent to your account please verify"
            });
    }
    }catch(err){
        res.status(500).send({
            status: "Failed", message: "Something bad happen"+err
        }); 
    }
}

const signIn =async (req,res) =>{
    try{
        let {email , password} = req.body;
        email = email.trim();
        password = password.trim(); 
    
        if(email == "" || password == ""){
            res.status(403).json({status: "Failed" ,message:"Empty credentials"});
        }
        else{
            User.find({email}).then(data =>{
                if(data){
                    const hashedPassword =  data[0].password;
                    bcrypt.compare(password, hashedPassword).then(result =>{
                        if (result){
                            let response = {
                                success: true,
                                message: "Successfully login"
                            }
                            if(data[0].is_verified == false)
                                response.is_verified = false;
                            else
                                response.is_verified = true;
                            res.status(200).send(response);
                        }
                        else{
                            res.status(400).json({success: false, message: "Invalid credentials"});   
                        }
                    });
                }
            }).catch(err =>{
                res.status(400).json({success: false, message: "Invalid credentials"});
            });
        }
    }catch(error){
        res.json({success: false ,message:"Server Error"});
    }

}

const verifyEmail = async (req, res) => {
    try{
        let user = await User.findOne({_id: req.params.id});
    
        if(!user) return res.status(400).send({message: "Invalid Link"});
        let verify = await UserVerification.findOne({
            userId: user._id,
            token: req.params.token
        });
    
        if(!verify) return  res.status(400).send({message: "Invalid Link"});
    
        await User.updateOne({_id:user._id},{is_verified:true})
                  .then(result=>console.log("Updated Docs : ", result))
                  .catch(error=>console.log(error));
        
        await verify.deleteOne();
        
        res.status(200).send({message: "Email verified successfully"});
    }catch(err){
        res.status(500).send({message: "Internal server error"});
    }
}

const sendEmailVerification = async (email, subject, text) => {
    try{
        let transporter = nodemailer.createTransport({
            host: process.env.HOST,
            service: process.env.SERVICE,
            port: process.env.EMAIL_PORT,
            // secure: Boolean(process.env.SECURE),
            auth:{
                user: process.env.AUTH_EMAIL,
                pass: process.env.AUTH_PASS
            }
        });
        
        await transporter.sendMail({
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: subject,
            text: text
        });
        console.log("Email sent successfully");
    }catch(err){
        console.log("Email is not sent");
        console.log(err);
    }
}
module.exports = {signUp, signIn, verifyEmail};

const generateTokens= async (user)=>{
    try{
        const payload={_id:user._id,roles:user.roles};
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_TOKEN_PRIVATE_KEY,
            {expiresIn:"14m"}
        );
        
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_TOKEN_PRIVATE_KEY,
            {expiresIn:"30d"}
        );
        
        const userToken= await UserToken.findOne({userId:user._id});
        if(userToken) await userToken.remove();

        await new UserToken({userId:user._id,token:refreshToken}).save();
        return Promise.resolve({accessToken,refreshToken});
        
    }catch(err){
        return Promise.reject(err);
    }

}