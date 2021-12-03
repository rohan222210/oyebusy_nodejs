const jwl = require("jsonwebtoken");
const Register = require("../models/register");

const auth = async (req, res, next) =>{
    try {
        const token = req.cookies.jwl;
        const verifyUser = jwl.verify(token,process.env.SECRET_KEY);

        const user = await Register.findOne({_id:verifyUser._id});

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).send(error);
    }
}

module.exports = auth;