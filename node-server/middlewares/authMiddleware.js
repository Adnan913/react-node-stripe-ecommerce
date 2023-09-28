const authMiddleware = (req, res, next)=> {
    try{
        const token = req.headers.authorization;
        if(!token) res.send({success:false, message:unauthorized});
        else 
        next();

    }catch(err){
        res.status(401).send({status: false, message: "Unautherized user" });
    }
}

module.exports = authMiddleware;