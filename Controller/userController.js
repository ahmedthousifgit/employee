const User = require('../Model/userModel');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const { render } = require('../Routes/userRoute');



const securePassword = async(password)=>{
  try{

    const passwordHash = await bcrypt.hash(password , 10);
    return passwordHash;

  } catch(error){
    console.log(error.message);
  }
}




// for send mail
const sendVerifyMail = async(name, email, user_id)=>{
   
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
      subject:'for varification mail',
      html:`<p>hi ${name}, please click here to <a href="${varificationUrl}"> here </a>verify your mail.</p>`,

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




const loadRegister = async(req,res)=>{

  try{
    
    res.render('registration')
  } catch(error){
    console.log(error.message);
  }
}



const insertUser = async(req,res)=>{

  try{
      const spassword = await securePassword(req.body.password);
      const user = new User({
        name:req.body.name,
        email:req.body.email,
        mobile:req.body.mno,
        image:req.file.filename,
        password:spassword,
        is_admin:0

      })

      const userData = await user.save();
       
      if(userData){
        sendVerifyMail(req.body.name , req.body.email, userData._id);
        res.render('registration',{message:"your registration has been succesfully, please varify your mail."})
      }
      else{
        res.render('registration',{message:"your registration has been failed."})
      }
      
  } 
  catch (error){
    console.log(error.message)
  }
   
}





 const verifyMail = async(req,res)=>{
   try{
      const updateInfo = await User.updateOne({_id:req.query.id},{$set:{is_verified:1} })
      console.log(updateInfo);
      res.render("email-verified");

   }catch(error){
    console.log(error.message);
   }
 }



 // Login user method started 

 const loginLoad = async (req,res)=>{
   try {
     res.render('login');
   } catch (error) {
     console.log(error.message);
   }
 }






      const Verifylogin = async (req, res) => {
        try {
            const email = req.body.email;
            const password = req.body.password;
    
            const userData = await User.findOne({ email: email });
    
            if (userData) {
                const passwordMatch = await bcrypt.compare(password, userData.password);
                if (passwordMatch) {
                    if (userData.is_verified === 0) {
                        res.render('login', { message: 'Please verify your mail.' });
                    } else if (userData.is_admin === 0) { // Check if is_admin is 0
                        req.session.user_id = userData._id;
                        res.redirect('/home');
                    } else {
                        res.render('login', { message: 'Invalid login' });
                    }
                } else {
                    res.render('login', { message: 'Email or password is incorrect' });
                }
            } else {
                res.render('login', { message: 'Email or password is incorrect' });
            }
        } catch (error) {
            console.log(error.message);
        }
    }




      const loadHome = async (req,res)=>{

        try{

          const userData = await User.findById({_id:req.session.user_id})
          res.render('home',{user:userData});
        }catch(error){
          console.log(error.message);
        }
      }



      const userLogout = async(req,res)=>{
        try {
          req.session.destroy();
          res.redirect('/');

        } catch (error) {
          console.log(error.message);
        }
      }



      // user profile edit...
      const editLoad = async (req,res)=>{
        try {
          
          const id = req.query.id;
          const userData = await User.findById({ _id:id });
          if(userData){
            res.render('edit',{ user: userData })
          }
             else{
              res.redirect('/home')
             } 

        } catch (error) {
          console.log("1",error.message);
        }
      }


     const  updateProfile = async(req,res)=>{
       
      try{
            
        if(req.file){
          const userData  = await User.findByIdAndUpdate(
            {_id:req.body.user_id},
            { $set:{name:req.body.name, email:req.body.email, mobile:req.body.mno, image:req.file.filename}})
        
        }
        else{
            
          const userData  = await User.findByIdAndUpdate(
            {_id:req.body.user_id},
            { $set:{name:req.body.name, email:req.body.email, mobile:req.body.mno}})
          
        }
       
          // const userData  = await User.findByIdAndUpdate(
          //    {_id:req.body.user_id},
          //    { $set:{name:req.body.name, email:req.body.email, mobile:req.body.mno}})
         
        res.redirect('/home');

      }catch(error){
          console.log(error.message);

      }

     }


      module.exports={

        loadRegister,
        insertUser,
        verifyMail,
        loginLoad,
        Verifylogin,
        loadHome,
        userLogout,
        editLoad,
        updateProfile
        
      }