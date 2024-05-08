  
  const User = require("../Model/userModel");
  const bcrypt = require('bcrypt');
  const nodemailer = require("nodemailer");
  const randomstring = require("randomstring");
  
  // const { response } = require("../Routes/adminRoute")

  const securePassword = async(password)=>{
    try{

      const passwordHash = await bcrypt.hash(password , 10);
      return passwordHash;

    } catch(error){
      console.log(error.message);
    }
  }


  // for send mail
  const addUserMail = async(name, email, password ,user_id)=>{
    
    try {
      const transporter= nodemailer.createTransport({

        host:'smtp.gmail.com',
        port:465,
        secure:true,
        requireTLS:true,
        auth: {
          user:'jishadlm10@gmail.com',
          pass:'dffm iwlp gffg gwby'
        },
      });
      const varificationUrl = `http://localhost:7000/verify?id=${user_id}`;

      const mailOptions = {
        from:'jishadlm10@gmail.com',
        to:email,
        subject:'Admin added you and and verify your mail',
        html:`<p>hi ${name}, please click here to <a href="${varificationUrl}"> here </a>verify your mail.</p> <br> <b>Email: </b>${email} <br> <b>password:</b> ${password} `,

  }

  transporter.sendMail(mailOptions,function(error,info){
      if(error){
        console.log(error); 
      }
      else{
        console.log("Eamil has been send: ",info.response);
      }
  })

    }catch(error){
      console.log(error.message);
    }
  }

  const loadLogin = async (req,res)=>{
    try {
        res.render('login')
    } catch (error) {
      console.log(error.message)
    }
  }
  
  const verifyLogin = async (req,res)=>{
      
    try {

      const email = req.body.email;
      const password = req.body.password;

    const userData = await User.findOne({email:email})

    if (userData) {
      
      const passwordMatch = await bcrypt.compare(password, userData.password);

      if (passwordMatch) {
        if (userData.is_admin === 1) {

          req.session.user_id = userData._id;
          res.redirect("/admin/home");

        } else {
          res.render('login',{message:"You are not authorized to access the admin dashboard."});
        }
      } else {
        res.render('login',{message:" email and password is incorrect"});
      } 
    } else {
      res.render('login',{message: "Incorrect Email and Password"})
    }

    } catch (error) {

      console.log(error.message);

    }
  } 

    
  const loadDashbord = async (req,res)=>{

    try {

      const userData = await User.findById({_id:req.session.user_id});
        res.render('home',{admin:userData});

    } catch (error) {
      console.log(error.message)
    }
  }

  

  const logout = async (req,res)=>{

    try {
      
      req.session.destroy();
      res.redirect('/admin');


    } catch (error) {
      console.log(error.message)
    }
  }

  // const loadRegister = async(req,res)=>{
  //   try {
  //     res.render('registration')
  //   } catch (error) {
  //     console.log(error.message)
  //   }
  // }

  

  const admindashboard = async(req,res)=>{
    try {
      
      var search='';
      if(req.query.search){
         search=req.query.search
      }

      const usersData = await User.find({
        is_admin:0,
        $or:[
          { name:{$regex:'.*'+search+'.*',$options:'i'} },
          { email:{$regex:'.*'+search+'.*',$options:'i'} },
          { mobile:{$regex:'.*'+search+'.*',$options:'i'} }
        ]
      })
      
      res.render('dashboard',{users:usersData});
    } catch (error) {
      console.log(error.message)
    }
  }

  
  // add new users from admin
  const newUserLoad = async (req,res)=>{
    
    try {
      res.render('new-user')
    } catch (error) {
      console.log(error.message);
    }
  }

  

  const addUser = async (req,res)=>{

    try {
      const name = req.body.name;
      const email = req.body.email;
      const mno = req.body.mno;
      const image = req.file.filename;
      const password = randomstring.generate(8);
      

      const spassword = await securePassword(password);

    const user= new User({
      name:name,
      email:email,
      mobile:mno,
      image: image,
      password:spassword,
      is_admin:0

    });


    const userData = await user.save();

    if (userData) {
        addUserMail(name,email,password,userData._id)
        res.redirect('/admin/dashboard')
    } else {
      res.render('new-user',{message:"somthing wrong."})
    }
      
    } catch (error) {
      console.log(error.message);
    }
  }

  // edit user function

  const editUserload = async(req,res)=>{

    try {
       const id = req.query.id;
       const userData= await User.findById({ _id:id })
       if(userData){
        res.render('edit-user',{user:userData})
       }else{
        res.redirect('/admin/dashboard')
       }
       
    } catch (error) {
      console.log(error.message)
    }
  }

  
//   const updateUsers = async(req,res)=>{
//     try {
//        const userData = await User.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name, email:req.body.email, mobile:req.body.mno, is_verified:req.body.verify}});
//        res.redirect('/admin/dashboard');
//     } catch (error) {
//         console.log(error.message);
//    }
// }


const updateUsers = async (req, res) => {

  try {

      if (req.file) {
          const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mno, image: req.file.filename } })


      } else {
          const userData = await User.findByIdAndUpdate({ _id: req.body.user_id }, { $set: { name: req.body.name, email: req.body.email, mobile: req.body.mno } })

      }
      res.redirect('/admin/dashboard')

  } catch (error) {
      console.log(error.message);

  }

}


//delete user

const deleteUser = async(req,res)=>{
  try {
    const id = req.query.id;
     await User.deleteOne({_id:id});
     res.redirect('/admin/dashboard')
  } catch (error) {
    console.log(error.message)
  }
}





  // const insertUser=async(req,res)=>{
  //   try{
  //       const spassword=await securePassword(req.body.password);         
  //       const user=new User({
  //               name:req.body.name,
  //               email:req.body.email,
  //               mobile:req.body.mno,
  //               image:req.file.filename,
  //               password:spassword,
  //               is_admin:0
  //           });

  //           const userData=await user.save();
            
  //           if(userData){
  //               sendVerifyMail(req.body.name, req.body.email, userData._id);
  //               res.render('registration',{message:"Your registration has been successfully completed"});
  //           }
  //           else{
  //               res.render('registration',{message:"Your registration has been failed"});
  //           }

  //   }catch(error){
  //       console.log(error.message);
  //   }
  // }

  // const verifyMail=async(req,res)=>{
  //   try {
  //       const updateInfo=await User.updateOne({_id:req.query.id},{$set:{is_verified:1}});
  //       console.log(updateInfo);
  //       res.render("email-verified");
  //   } catch (error) {
  //       console.log(error.message)
  //   }
  // }




  module.exports = {
    loadLogin ,
    verifyLogin,
    addUserMail,
    loadDashbord,
    logout,
    admindashboard,
    newUserLoad,
    addUser,
    editUserload,
    updateUsers,
    deleteUser

    // loadRegister,
    // insertUser,
    // verifyMail
  }