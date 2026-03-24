import jwt from 'jsonwebtoken'
import User from '../models/User.js';
const verifyUser = async(req,res,next)=>{
  try{
     const authHeader = req.headers.authorization;
     if(!authHeader){
      return res.status(404).json({success:false,error:"Token Not Provided"})
     }
     const token=authHeader.split(' ')[1];
     if(!token){
      return res.status(404).json({success:false,error:"Token Not Provided"})
     }
  const decoded=await jwt.verify(token,process.env.JWT_KEY)
  if(!decoded){
    return res.status(404).json({success:false,error:"Token Not Valid"})
  }
  const user= await User.findById({_id:decoded._id}).select('-password')

  if(!user){
    return res.status(404).json({success:false,error:"User not found"})
  }
  req.user=user
  next()
  }catch(error){
  console.error("Verify user error:", error);
  return res.status(500).json({success:false,error: error.message || "server error"})
  }

}
export default verifyUser
