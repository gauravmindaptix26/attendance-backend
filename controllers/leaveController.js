import Leave from "../models/Leave.js"
import Employee from "../models/Employee.js"
import Department from "../models/Department.js"
import User from "../models/User.js"
 const addLeave = async (req, res) => {
  try {
    const {
      userId,
      leaveType,
      startDate,
      endDate,
      reason,
      designation,
      totalEntitlement,
      totalAvailed,
      balance,
      recommendedBy,
      approvedBy,
      name,
      date,
    } = req.body;

    // 🧩 Find employee by userId (ensure relation)
    const employee = await Employee.findOne({ userId });
    if (!employee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found for the given userId",
      });
    }

    // 🧮 Calculate number of days automatically (optional)
    let noOfDays = 0;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      noOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    // 🆕 Create new leave document
    const newLeave = new Leave({
      employeeId: employee._id,
      name: name || employee.name, // fallback to employee record
      designation,
      date,
      leaveType,
      startDate,
      endDate,
      noOfDays,
      reason,
      totalEntitlement,
      totalAvailed,
      balance,
      recommendedBy,
      approvedBy,
    });

    await newLeave.save();

    return res.status(200).json({
      success: true,
      message: "Leave application submitted successfully",
      leave: newLeave,
    });
  } catch (error) {
    console.error("Error adding leave:", error);
    return res.status(500).json({
      success: false,
      error: "Leave add server error",
    });
  }
};
const getLeave=async(req,res)=>{
  try {
    const {id,role}=req.params;
    let leaves
if(role==="admin"){
   leaves =await Leave.find({employeeId:id})
}else{
   
    const employee=await Employee.findOne({userId:id})
     leaves =await Leave.find({employeeId:employee._id})
    
  }
    return res.status(200).json({success:true,leaves})
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({success:false,error:"leave add server error"})
    
  }
}
const getLeaves=async(req,res)=>{
  try {
    const leaves=await Leave.find().populate({
      path:"employeeId",
      populate:[
        {
        path:'department',
        select:'dep_name'
        },{
          path:'userId',
          select:'name,profileImage'
        }
      ]
  })
    return res.status(200).json({success:true,leaves})
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({success:false,error:"leave add server error"})
    
  }
}
const updateLeave=async(req,res)=>{
  try {
    const {id}=req.params;
    const leave=await Leave.findByIdAndUpdate({_id:id},{status:req.body.status})
   if(!leave){
  return res.status(404).json({success:false,error:"leave and server error"})
}
    return res.status(200).json({success:true,leave})
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({success:false,error:"leave update server error"})
    
  }
}

const getdetail=async(req,res)=>{
  try {
    const {id}=req.params;
    const detail=await Leave.findById({_id:id}).populate({
      path:"employeeId",   
      populate:[
{
path:'department',
select:'dep_name'
},{
  path:'userId',
  select:'name profileImage'
}
      ]
      
    })
  
  
    return res.status(200).json({success:true,detail})
  } catch (error) {
    console.log(error.message)
    return res.status(500).json({success:false,error:"leave add server error"})
    
  }
}


export { addLeave,getLeave,getLeaves,getdetail,updateLeave}