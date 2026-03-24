import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import bcrypt from 'bcrypt'

const login = async (req,res)=>{
  try{
   const {email,password}=req.body;
   if(!email || !password){
    return res.status(400).json({success:false,error:"Email and password are required"})
   }

   const user=await User.findOne({email})
  if(!user){
   return res.status(404).json({success:false,error:"User not found"}) 
  }

  const isMatch =await bcrypt.compare(password,user.password)
  if(!isMatch){
    return res.status(404).json({success:false,error:"Wrong password"})
  }

  if(!process.env.JWT_KEY){
    return res.status(500).json({success:false,error:"JWT_KEY is missing on the server"})
  }

    const token = jwt.sign({_id:user._id,role:user.role},
      process.env.JWT_KEY, {expiresIn:"10d"}
    )
    res.status(200).json({success:true,token,user:{_id:user._id,name:user.name,role:user.role,email:user.email},});
  }catch(error){
    console.error("Login error:", error);
    res.status(500).json({success:false,error:error.message})
  }
};
const verify= (req,res)=>{
   return res.status(200).json({success:true,user:req.user})
}
export{login,verify}
