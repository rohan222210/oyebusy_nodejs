const { JsonWebTokenError } = require("jsonwebtoken");
const mongoose = require("mongoose");
const jwt = require("JsonWebToken");


const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    organization:{
        type:String,
    },
    dateofbirth:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    cpassword:{
        type:String,
        required:true
    },
    tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
});


// middle ware -------->

// Genrate Token
userSchema.methods.generateToken = async function(){
    try {
        const token = jwt.sign({_id: this._id}, process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save(); 
        return token;
    } catch (error) {
        res.send("The error part");
        console.log("The error part");
    }
}

// Now create a collection 
const Register = new mongoose.model("User",userSchema);

module.exports = Register;