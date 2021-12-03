const mongoose = require("mongoose");
const jwt = require("JsonWebToken");


const userbandSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    origin:{
        type:String,
        required:true
    },
    rating:{
         type:String
    }
    
});

const userBand = new mongoose.model("userband",userbandSchema);

module.exports = userBand;