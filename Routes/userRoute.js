 const express= require("express");
 const user_route = express();
 const session = require("express-session");
 const config = require("../Config/config");
 const multer = require("multer");
 const path= require("path");
 const auth = require("../middleware/auth")
 const bodyParser = require('body-parser');
 
 user_route.use(session({secret:config.sessionSecret}))
 


user_route.set('view engine','ejs');
user_route.set('views','./View/users')


user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))


user_route.use(express.static('public'))
user_route.use('/css',express.static(__dirname+'public/css'))
user_route.use("/public", express.static("public", { "extensions": ["js"] }));


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




const userController = require("../Controller/userController");


user_route.get('/register',auth.isLogout,userController.loadRegister);
user_route.post('/register',upload.single('image'),userController.insertUser);
user_route.get('/verify',userController.verifyMail);
user_route.get('/',auth.isLogout,userController.loginLoad);
user_route.get('/login',auth.isLogout,userController.loginLoad);
user_route.post('/login',userController.Verifylogin)
user_route.get('/home',auth.isLogin,userController.loadHome)
user_route.get('/logout',auth.isLogin,userController.userLogout)
user_route.get('/edit',auth.isLogin,userController.editLoad)
user_route.post('/edit',upload.single('image'),userController.updateProfile)


module.exports = user_route;