const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASECONNECTION)
.then(()=>{
    console.log('connection successful');
}).catch((error)=>{
    console.log(error);
})