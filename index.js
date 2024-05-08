const  mongoose  = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/user_management_Database");

const express = require("express");
const app = express();

app.use(express.static('public'))


// for user routes
const userRoute = require('./Routes/userRoute');
app.use('/',userRoute);



// for admin routes
const adminRoute = require('./Routes/adminRoute');
app.use('/admin',adminRoute);


app.listen(7000,()=>{
  console.log("Server is Running")
});