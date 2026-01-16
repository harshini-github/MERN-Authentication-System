//to create API endpoint
// creater a user ,Without userModel, authController cannot talk to MongoDB
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken'; 
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
//user registration function
export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Missing Details',
    });
  }

  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Send token via cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // Send welcome email
    const mailOptions = {
      from: `"MERN AUTH" <${process.env.SENDER_EMAIL}>`,
      to: email,
      subject: 'Welcome to MERN AUTH',
      text: `Welcome to MERN AUTH website. Your account has been created with email id: ${email}`,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log("✅ Mail sent:", info.messageId);
    } catch (mailError) {
      console.error("❌ Mail error:", mailError.message);
    }

    //  Final response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
    });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
//controller func for login
export const login = async (req,res)=>{
  const {email,password} = req.body;  
  if(!email || !password){
    return res.status(400).json({success:false,message:'Email and Password are required'})
  }
  try{
     const user = await userModel.findOne({email});
     if(!user){
      return res.json({success:false, message:'Invalid email'})
     }
     const isMatch = await bcrypt.compare(password,user.password);
     if(!isMatch){
      return res.json({success:false, message:'Invalid Password'});
     }
     //to generate token
     const token = jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:'7d'});
     //using the generated token to users in response
     //response will add the cookie,using cookie we send the token
     //i.e added the token in the cookie
     res.cookie('token', token,{
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite:process.env.NODE_ENV === 'production' ?
      'none': 'strict',
      maxAge: 7*24*60*60*1000,
     });
     return res.json({success:true, message:'Login successful'});
  }catch (error){
    return res.json({success:false,message:error.message});
  }
  
}
//logout function
export const logout= async(req,res)=>{
  try{
    res.clearCookie('token', {
      httpOnly:true,
      secure:process.env.NODE_ENV === 'production',
      sameSite:process.env.NODE_ENV === 'production' ?
      'none': 'strict',
    })
    return res.json({success:true, message:'Logout successful'});
  }catch(error){
    return res.json({success:false,message:error.message});
  }
}
//using controllen fuc we need to create api endpoint using authcontroller for that we need to create routes
// send verification otp to users email,user email verification function
//controller func to send verify otp to email
export const sendVerifyOtp = async (req, res) => {
  try{
    const userId = req.userId;
    const user = await userModel.findById(userId);
    if(user.isAccountVerified){
      return res.json({success: false,message:"Account Already verified"})
    }
    // to generate otp we use math.random()
    const otp =String(Math.floor(100000 + Math.random() * 900000));
    // we have to save otp for a particular user
    user.verifyOtp =otp;
    user.verifyOtpExpireAt = Date.now() + 24*60*60*1000;
    await user.save();
    const mailOption ={
      from: `"MERN AUTH" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: 'Account Verification OTP',
      text: `Your account verification code is: ${otp},Verify your account using this OTP.`
    }
    await transporter.sendMail(mailOption);
    res.json({success: true, message: "OTP sent successfully"});
  }catch (error){
    res.json({success:false,message:error.message});
  }
}
//controller func for email verification using otp
export const verifyEmail = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.userId; // userid from middleware

    if (!otp) {
      return res.json({ success: false, message: "Missing OTP" });
    }

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }

    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP expired" });
    }

    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;

    await user.save();

    return res.json({ success: true, message: "Email verified successfully" });

  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};
//check if the user is authenticated i.e login already or not
export const isAuthenticated = async (req, res) => {
  try{
    return res.json({success: true, message: "User is authenticated"});
  }catch (error){
    return res.json({success: false, message: error.message});
  }
}

//sending password reset otp
export const sendResetOtp = async (req, res) => {
  const {email} = req.body;
  if(!email){
    return res.json({success: false, message: "Email is required"});
  }
  try{
    const user = await userModel.findOne({email});
    if(!user){
      return res.json({success: false, message: "User not found"});
    }
        // to generate otp we use math.random()
    const otp =String(Math.floor(100000 + Math.random() * 900000));
    // we have to save otp for a particular user
    user.resetOtp =otp;
    user.resetOtpExpireAt = Date.now() + 15*60*1000;
    await user.save();

    const mailOption ={
      from: `"MERN AUTH" <${process.env.SENDER_EMAIL}>`,
      to: user.email,
      subject: 'Password Reset OTP',
      text: `Your OTP for ressetting your password is: ${otp},Use this OTP to reset your password.`
    }
    await transporter.sendMail(mailOption);
     return res.json({success: true, message: "OTP sent successfully to yor email"});
  }catch (error){
    res.json({success:false,message:error.message});
  }
}
//reset user password
export const resetPassword = async(req, res) => {
  const{email,otp,newPassword} = req.body;
  if(!email||!otp||!newPassword){
    return res.json({success: false, message: "Email,OTP and new password are required"});
  }
  try{
   const user = await userModel.findOne({email});
   if(!user){
    return res.json({success: false, message: "User not found"});
   }
   if(user.resetOtp === "" || user.resetOtp !== otp){
    return res.json({success: false, message: "Invalid OTP"});
   }
   if(user.resetOtpExpireAt < Date.now()){
    return res.json({success: false, message: "OTP expired"});
   }
   const hashedPassword = await bcrypt.hash(newPassword, 10);
   user.password = hashedPassword;
   user.resetOtp = "";
   user.resetOtpExpireAt = 0;
   await user.save();
   return res.json({success: true, message: "Password reset is successfull"});
  }catch(error){
    return res.json({success: false, message: error.message});
  }
}

