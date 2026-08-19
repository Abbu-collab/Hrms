import jwt from "jsonwebtoken";
import Attendance from "../models/Attendance.js";


// ================= CHECK IN SERVICE =================

export const checkInService = async ({ employeeId, location, remarks, biometricToken }) => {

  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const existingAttendance = await Attendance.findOne({
    employeeId,
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    }
  });

  if (existingAttendance) {
    throw new Error("Employee already checked in today.");
  }

  // Verify biometric verification token if provided
  let checkInMethod = "MANUAL";
  let livenessVerified = false;
  let biometricVerifiedAt = null;

  if (biometricToken) {
    try {
      const decoded = jwt.verify(biometricToken, process.env.JWT_SECRET);
      if (String(decoded.userId) !== String(employeeId) || decoded.purpose !== "biometric_attendance") {
        throw new Error("Biometric token does not match authenticated user.");
      }
      checkInMethod = "FACE";
      livenessVerified = true;
      biometricVerifiedAt = new Date(decoded.verifiedAt || Date.now());
    } catch (err) {
      throw new Error(err.message || "Invalid or expired biometric token. Please re-verify your face.");
    }
  }

  // Late after 9:30 AM
  const officeTime = new Date(today);
  officeTime.setHours(9, 30, 0, 0);

  let status = "Present";

  if (today > officeTime) {
    status = "Late";
  }

  const attendance = await Attendance.create({
    employeeId,
    date: today,
    checkIn: today,
    location,
    remarks: remarks || (status === "Late" ? "Late check in" : "Checked in on time"),
    status,
    checkInMethod,
    livenessVerified,
    biometricVerifiedAt,
  });

  return attendance;
};


// ================= CHECK OUT SERVICE =================

export const checkOutService = async (employeeId, biometricToken) => {

  const today = new Date();

  const startOfDay = new Date(today);
  startOfDay.setHours(0,0,0,0);

  const endOfDay = new Date(today);
  endOfDay.setHours(23,59,59,999);

  const attendance = await Attendance.findOne({
    employeeId,
    date:{
      $gte:startOfDay,
      $lte:endOfDay
    }
  });

  if(!attendance){
    throw new Error("Check In not found for today.");
  }

  if(attendance.checkOut){
    throw new Error("Employee already checked out.");
  }

  // Verify biometric token for check out if provided
  let checkOutMethod = "MANUAL";

  if (biometricToken) {
    try {
      const decoded = jwt.verify(biometricToken, process.env.JWT_SECRET);
      if (String(decoded.userId) !== String(employeeId) || decoded.purpose !== "biometric_attendance") {
        throw new Error("Biometric token does not match authenticated user.");
      }
      checkOutMethod = "FACE";
      attendance.livenessVerified = true;
      attendance.biometricVerifiedAt = new Date(decoded.verifiedAt || Date.now());
    } catch (err) {
      throw new Error(err.message || "Invalid or expired biometric token. Please re-verify your face.");
    }
  }

  attendance.checkOut = today;
  attendance.checkOutMethod = checkOutMethod;




  // Calculate working hours

  const hours =
    (attendance.checkOut.getTime() -
     attendance.checkIn.getTime())
     /
     (1000 * 60 * 60);



  attendance.workingHours = Number(hours.toFixed(2));







  // Check late

  const officeTime = new Date(attendance.checkIn);

  officeTime.setHours(9,30,0,0);



  const isLate = attendance.checkIn > officeTime;








  // FINAL STATUS + REMARKS



  if(attendance.workingHours < 4){


    attendance.status = "Early Checkout";

    attendance.remarks = "Checked out early";


  }




  else if(
    attendance.workingHours >= 4 &&
    attendance.workingHours < 8
  ){


    if(isLate){

      attendance.status = "Late";

      attendance.remarks = "Late check in";

    }

    else{

      attendance.status = "Half Day";

      attendance.remarks = "Half day completed";

    }


  }





  else if(attendance.workingHours >= 8){



    if(isLate){

      attendance.status = "Late";

      attendance.remarks = "Late check in";

    }

    else{

      attendance.status = "Present";

      attendance.remarks = "Full day completed";

    }


  }






  await attendance.save();



  return attendance;


};

// ================= TODAY ATTENDANCE =================


export const getTodayAttendanceService = async(employeeId)=>{


  const today = new Date();


  const startOfDay = new Date(today);

  startOfDay.setHours(0,0,0,0);



  const endOfDay = new Date(today);

  endOfDay.setHours(23,59,59,999);




  return await Attendance.findOne({

    employeeId,

    date:{
      $gte:startOfDay,
      $lte:endOfDay
    }

  });


};



// ================= ATTENDANCE HISTORY =================


export const getAttendanceHistoryService = async(employeeId)=>{


  return await Attendance.find({

    employeeId

  })
  .sort({

    date:-1

  });


};

// ================= MONTHLY ATTENDANCE =================


export const getMonthlyAttendanceService = async(
  employeeId,
  year,
  month
)=>{


  const startDate = new Date(year, month-1,1);



  const endDate = new Date(
    year,
    month,
    0,
    23,
    59,
    59
  );




  return await Attendance.find({

    employeeId,

    date:{
      $gte:startDate,
      $lte:endDate
    }

  })
  .sort({

    date:1

  });


};



// ================= CALENDAR ATTENDANCE =================


export const getAttendanceCalendarService = async(
  employeeId,
  year,
  month
)=>{


  const startDate = new Date(
    year,
    month-1,
    1
  );



  const endDate = new Date(
    year,
    month,
    0,
    23,
    59,
    59
  );




  const records = await Attendance.find({

    employeeId,

    date:{
      $gte:startDate,
      $lte:endDate
    }

  })
  .select("date status");





  return records.map(record=>({

    date: record.date,

    status: record.status

  }));


};


// ================= ADMIN: ALL EMPLOYEES ATTENDANCE =================

export const getAllAttendanceAdminService = async ({ status, employeeId } = {}) => {

  const query = {};

  if (status) {
    query.status = status;
  }

  if (employeeId) {
    query.employeeId = employeeId;
  }

  return await Attendance.find(query).sort({ date: -1 });

};