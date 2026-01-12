import mongoose from "mongoose";
//giving function
const connectDB = async () =>{
  // giving event
  mongoose.connection.on('connected', ()=>console.log("Database Connected Successfully"));
  await mongoose.connect( `${process.env.MONGODB_URI}/MERN-AUTH`);
};
export default connectDB;