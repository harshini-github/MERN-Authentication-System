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
    return res.status.json({success:false,message:'Email and Paaword are required'})
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

