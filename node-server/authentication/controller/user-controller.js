require('dotenv').config();
const nodemailer = require('nodemailer');
const User = require('../model/user-model');
const UserVerification = require('../model/user-verification-model');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const signUp = async (req, res) =>{
    try{
        let {email , password, phone, role} = req.body;
        email = email.trim();
        password = password.trim();
        phone = phone.trim();
        role = role.trim();
        
        if(email == "" || password == "" || phone =="" || role == ""){
            res.send({
                status: "Failed", message: "Empty input fields"
            });
        }
        let user = await User.find({email});
        
        if(user.length){
            return res.send({
                status: "Failed", message: "User exist",data:user
            });
            
        }else{
            const hashedPassword =await bcrypt.hash(password,10);
            const newUser = await new User({
                    email, password: hashedPassword,role, phone
            }).save();

            const verification = await new  UserVerification({
                userId: newUser._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();

            const url = `${process.env.BASE_URL}/user/${newUser._id}/verify/${verification.token}`;
            await sendEmailVerification(newUser.email,"Verify Email", url);

            res.send({
                status: "Success", message: "email sent to your account please verify"
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
            res.json({status: "Failed" ,message:"Empty credentials"});
        }
        else{
            User.find({email}).then(data =>{
                if(data){
                    const hashedPassword =  data[0].password;
                    bcrypt.compare(password, hashedPassword).then(result =>{
                        if (result){
                            res.json({status: "Success" ,message:"login Successful", data: data});
                        }
                        else{
                            res.json({status: "Failed" ,message:"invalid credentials"});   
                        }
                    });
                }
            }).catch(err =>{
                res.json({status: "Failed" ,message:"error occured"});
            })
        }

    }catch(error){
        res.json({status: "Failed" ,message:"Server Error"});
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