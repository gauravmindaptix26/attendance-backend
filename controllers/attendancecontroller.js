
import Employee from '../models/Employee.js'
import Attendance from '../models/Attendance.js'

export const attendancecontroller = async (req, res) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    
    const employees = await Employee.find()
      .populate("userId", { password: 0 })
      .populate("department");

   
    const attendanceRecords = await Attendance.find({
      date: { $gte: todayStart, $lte: todayEnd }
    });

 
    const data = employees.map((emp, index) => {
      const record = attendanceRecords.find(
        (att) => att.employeeId.toString() === emp._id.toString()
      );

      return {
        _id: emp._id,
        sno: index + 1,
        name: emp.userId.name,
        employeeId: emp.employeeId,
        department: emp.department.dep_name,
        attendanceStatus: record ? record.status : null
      };
    });

    return res.status(200).json({ success: true, employees: data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "get employees server error" });
  }
};

export const attendance = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
   
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

   
    let record = await Attendance.findOne({
      employeeId: id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    if (!record) {
     
      record = new Attendance({
        employeeId: id,
        status,
        date: new Date()
      });
      await record.save();
    } else {
      
      record.status = status;
      await record.save();
    }

    return res
      .status(200)
      .json({ success: true, message: `Attendance marked as ${status}` });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Error marking attendance" });
  }
};

export const attendlist = async (req, res) => {
  try {
    const data = await Attendance.aggregate([
      {
        $addFields: {
          dateOnly: {
            $dateToString: { format: "%Y-%m-%d", date: "$date", timezone: "Asia/Kolkata" }
          }
        }
      },
      {
        $group: {
          _id: "$dateOnly",
          count: { $sum: 1 },
          records: { $push: { employeeId: "$employeeId", status: "$status" } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Return the aggregated data
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching attendance list:', error);
    return res.status(500).json({
      success: false,
      error: "Error fetching attendance records"
    });
  }
};



 