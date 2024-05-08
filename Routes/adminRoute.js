const express = require("express");
const admin_route = express();
const session = require("express-session");
const config = require('../Config/config');
const bodyParser= require ("body-parser");
const multer = require("multer");





admin_route.use(
  session({
    secret: config.sessionSecret,
    resave: false, // Set resave to false
    saveUninitialized: true, // Set saveUninitialized to true
  })
);




admin_route.use(bodyParser.json());
admin_route.use(bodyParser.urlencoded({extended:true}))
admin_route.set('view engine','ejs');
admin_route.set('views','./View/admin');



const path= require("path");
admin_route.use(express.static('public'))

const storage = multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,'../pulblic/userImages'))
  },
  filename:function(req,file,cb){
    const name = Date.now()+'-'+file.originalname;
    cb(null,name);
  }
});


const upload = multer({storage:storage});
const auth = require ("../middleware/adminAuth")
const adminController = require("../Controller/adminController");
// const { post } = require("./userRoute");

admin_route.get('/',auth.isLogout,adminController.loadLogin)
// admin_route.get('/',adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home',auth.isLogin,adminController.loadDashbord);
admin_route.get('/logout',auth.isLogin,adminController.logout)

admin_route.get('/dashboard',adminController.admindashboard)
admin_route.get('/new-user',auth.isLogin,adminController.newUserLoad)
admin_route.post('/new-user',upload.single('image'),adminController.addUser);
admin_route.get('/edit-user',auth.isLogin,adminController.editUserload)

admin_route.post('/edit-user',upload.single('image'),auth.isLogin,adminController.updateUsers)
admin_route.get('/delete-user',adminController.deleteUser);

admin_route.get('*',function(req,res){
    
  res.redirect('/admin');

});


module.exports = admin_route;

