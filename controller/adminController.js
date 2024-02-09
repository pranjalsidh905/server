import Admin from "../models/admin.js";
import Department from "../models/department.js";
import Faculty from "../models/faculty.js";
import Student from "../models/student.js";
import Subject from "../models/subject.js";
import Notice from "../models/notice.js";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import csv from "csv-parser";
import fs from "fs";
import multer from "multer";
import TimeTable from '../models/timetable.js'; 
import QuizzSchema from '../models/quiz.js'
import  Types  from 'mongoose'; // Import Types from mongoose
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const tempDestination = "./public/csvuploads/temp";
const uploadDestination = "./public/csvuploads/uploads"; 
import { ObjectId } from 'mongodb';
const validObjectIdString = new ObjectId().toString();

const currentModuleURL = new URL(import.meta.url);
const currentModuleDir = path.dirname(currentModuleURL.pathname);

const destinationPath = path.join(currentModuleDir, "public", "uploads");

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


export const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  const errors = { usernameError: String, passwordError: String };
  try {
    const existingAdmin = await Admin.findOne({ username });
    if (!existingAdmin) {
      errors.usernameError = "Admin doesn't exist.";
      return res.status(404).json(errors);
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      existingAdmin.password
    );
    if (!isPasswordCorrect) {
      errors.passwordError = "Invalid Credentials";
      return res.status(404).json(errors);
    }

    const token = jwt.sign(
      {
        email: existingAdmin.email,
        id: existingAdmin._id,
      },
      "sEcReT",
      { expiresIn: "1h" }
    );

    res.status(200).json({ result: existingAdmin, token: token });
  } catch (error) {
    console.log(error);
  }
};

export const updatedPassword = async (req, res) => {
  try {
    const { newPassword, confirmPassword, email } = req.body;
    const errors = { mismatchError: String };
    if (newPassword !== confirmPassword) {
      errors.mismatchError =
        "Your password and confirmation password do not match";
      return res.status(400).json(errors);
    }

    const admin = await Admin.findOne({ email });
    let hashedPassword;
    hashedPassword = await bcrypt.hash(newPassword, 10);
    admin.password = hashedPassword;
    await admin.save();
    if (admin.passwordUpdated === false) {
      admin.passwordUpdated = true;
      await admin.save();
    }

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
      response: admin,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const updateAdmin = async (req, res) => {
  try {
    const { name, dob, department, contactNumber, avatar, email } = req.body;
    const updatedAdmin = await Admin.findOne({ email });
    if (name) {
      updatedAdmin.name = name;
      await updatedAdmin.save();
    }
    if (dob) {
      updatedAdmin.dob = dob;
      await updatedAdmin.save();
    }
    if (department) {
      updatedAdmin.department = department;
      await updatedAdmin.save();
    }
    if (contactNumber) {
      updatedAdmin.contactNumber = contactNumber;
      await updatedAdmin.save();
    }
    if (avatar) {
      updatedAdmin.avatar = avatar;
      await updatedAdmin.save();
    }
    res.status(200).json(updatedAdmin);
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

// export const addAdmin = async (req, res) => {
//   try {
//     const { name, dob, department, contactNumber, avatar, email, joiningYear } =
//       req.body;
//     const errors = { emailError: String };
//     const existingAdmin = await Admin.findOne({ email });
//     if (existingAdmin) {
//       errors.emailError = "Email already exists";
//       return res.status(400).json(errors);
//     }
//     const existingDepartment = await Department.findOne({ department });
//     let departmentHelper = existingDepartment.departmentCode;
//     const admins = await Admin.find({ department });

//     let helper;
//     if (admins.length < 10) {
//       helper = "00" + admins.length.toString();
//     } else if (admins.length < 100 && admins.length > 9) {
//       helper = "0" + admins.length.toString();
//     } else {
//       helper = admins.length.toString();
//     }
//     var date = new Date();
//     var components = ["ADM", date.getFullYear(), departmentHelper, helper];

//     var username = components.join("");
//     let hashedPassword;
//     console.log(date, ">>>>>>>>>>>>>>>>>>");
//     const newDob = dob.split("-").reverse().join("-");

//     hashedPassword = await bcrypt.hash(newDob, 10);
//     var passwordUpdated = false;
//     const newAdmin = await new Admin({
//       name,
//       email,
//       password: hashedPassword,
//       joiningYear,
//       username,
//       department,
//       avatar,
//       contactNumber,
//       dob,
//       passwordUpdated,
//     });
//     await newAdmin.save();
//     return res.status(200).json({
//       success: true,
//       message: "Admin registerd successfully",
//       response: newAdmin,
//     });

//   } catch (error) {
//     console.error(error); // Log the error to the console for debugging

//     const errors = { backendError: String };
//     errors.backendError = error.message || "Internal Server Error";
//     res.status(500).json(errors);
//   }
// };

export const addAdmin = async (req, res) => {
  try {
    const { name, dob, department, contactNumber, avatar, email, joiningYear } =
      req.body;
    const errors = { emailError: String };

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      errors.emailError = "Email already exists";
      return res.status(400).json(errors);
    }

    const existingDepartment = await Department.findOne({ department });

    if (!existingDepartment) {
      // Handle the case where the department is not found
      const errors = { departmentError: "Department not found" };
      return res.status(400).json(errors);
    }

    let departmentHelper = existingDepartment.departmentCode;

    const admins = await Admin.find({ department });

    let helper;
    if (admins.length < 10) {
      helper = "00" + admins.length.toString();
    } else if (admins.length < 100 && admins.length > 9) {
      helper = "0" + admins.length.toString();
    } else {
      helper = admins.length.toString();
    }

    var date = new Date();
    var components = ["ADM", date.getFullYear(), departmentHelper, helper];
    var username = components.join("");

    let hashedPassword;

    const newDob = dob.split("-").reverse().join("-");
    console.log(newDob);
    hashedPassword = await bcrypt.hash(newDob, 10);

    var passwordUpdated = false;
    const newAdmin = await new Admin({
      name,
      email,
      password: hashedPassword,
      joiningYear,
      username,
      department,
      avatar,
      contactNumber,
      dob,
      passwordUpdated,
    });

    await newAdmin.save();

    return res.status(200).json({
      success: true,
      message: "Admin registered successfully",
      response: newAdmin,
    });
  } catch (error) {
    console.error(error); // Log the error to the console for debugging

    const errors = { backendError: String };
    errors.backendError = error.message || "Internal Server Error";
    res.status(500).json(errors);
  }
};

export const createNotice = async (req, res) => {
  try {
    const { from, content, topic, date, noticeFor } = req.body;

    const errors = { noticeError: String };
    const exisitingNotice = await Notice.findOne({ topic, content, date });
    if (exisitingNotice) {
      errors.noticeError = "Notice already created";
      return res.status(400).json(errors);
    }
    const newNotice = await new Notice({
      from,
      content,
      topic,
      noticeFor,
      date,
    });
    await newNotice.save();
    return res.status(200).json({
      success: true,
      message: "Notice created successfully",
      response: newNotice,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const addDepartment = async (req, res) => {
  try {
    const errors = { departmentError: String };
    const { department } = req.body;
    const existingDepartment = await Department.findOne({ department });
    if (existingDepartment) {
      errors.departmentError = "Department already added";
      return res.status(400).json(errors);
    }
    const departments = await Department.find({});
    let add = departments.length + 1;
    let departmentCode;
    if (add < 9) {
      departmentCode = "0" + add.toString();
    } else {
      departmentCode = add.toString();
    }

    const newDepartment = await new Department({
      department,
      departmentCode,
    });

    await newDepartment.save();
    return res.status(200).json({
      success: true,
      message: "Department added successfully",
      response: newDepartment,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const addFaculty = async (req, res) => {
  try {
    const {
      name,
      dob,
      department,
      contactNumber,
      avatar,
      email,
      joiningYear,
      gender,
      designation,
    } = req.body;
    const errors = { emailError: String };
    const existingFaculty = await Faculty.findOne({ email });
    if (existingFaculty) {
      errors.emailError = "Email already exists";
      return res.status(400).json(errors);
    }
    const existingDepartment = await Department.findOne({ department });
    let departmentHelper = existingDepartment.departmentCode;

    const faculties = await Faculty.find({ department });
    let helper;
    if (faculties.length < 10) {
      helper = "00" + faculties.length.toString();
    } else if (faculties.length < 100 && faculties.length > 9) {
      helper = "0" + faculties.length.toString();
    } else {
      helper = faculties.length.toString();
    }
    var date = new Date();
    var components = ["FAC", date.getFullYear(), departmentHelper, helper];

    var username = components.join("");
    let hashedPassword;
    const newDob = dob.split("-").reverse().join("-");

    hashedPassword = await bcrypt.hash(newDob, 10);
    var passwordUpdated = false;

    const newFaculty = await new Faculty({
      name,
      email,
      password: hashedPassword,
      joiningYear,
      username,
      department,
      avatar,
      contactNumber,
      dob,
      gender,
      designation,
      passwordUpdated,
    });
    await newFaculty.save();
    return res.status(200).json({
      success: true,
      message: "Faculty registerd successfully",
      response: newFaculty,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const getFaculty = async (req, res) => {
  try {
    const { department } = req.body;
    const errors = { noFacultyError: String };
    const faculties = await Faculty.find({ department });
    if (faculties.length === 0) {
      errors.noFacultyError = "No Faculty Found";
      return res.status(404).json(errors);
    }
    res.status(200).json({ result: faculties });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const getNotice = async (req, res) => {
  try {
    const errors = { noNoticeError: String };
    const notices = await Notice.find({});
    if (notices.length === 0) {
      errors.noNoticeError = "No Notice Found";
      return res.status(404).json(errors);
    }
    res.status(200).json({ result: notices });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const addSubject = async (req, res) => {
  try {
    const { totalLectures, department, subjectCode, subjectName, year } =
      req.body;
    const errors = { subjectError: String };
    const subject = await Subject.findOne({ subjectCode });
    if (subject) {
      errors.subjectError = "Given Subject is already added";
      return res.status(400).json(errors);
    }

    const newSubject = await new Subject({
      totalLectures,
      department,
      subjectCode,
      subjectName,
      year,
    });

    await newSubject.save();
    const students = await Student.find({ department, year });
    if (students.length !== 0) {
      for (var i = 0; i < students.length; i++) {
        students[i].subjects.push(newSubject._id);
        await students[i].save();
      }
    }
    return res.status(200).json({
      success: true,
      message: "Subject added successfully",
      response: newSubject,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const getSubject = async (req, res) => {
  try {
    const { department, year } = req.body;

    if (!req.userId) return res.json({ message: "Unauthenticated" });
    const errors = { noSubjectError: String };

    const subjects = await Subject.find({ department, year });
    if (subjects.length === 0) {
      errors.noSubjectError = "No Subject Found";
      return res.status(404).json(errors);
    }
    res.status(200).json({ result: subjects });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const getAdmin = async (req, res) => {
  try {
    const { department } = req.body;

    const errors = { noAdminError: String };

    const admins = await Admin.find({ department });
    if (admins.length === 0) {
      errors.noAdminError = "No Subject Found";
      return res.status(404).json(errors);
    }
    res.status(200).json({ result: admins });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const deleteAdmin = async (req, res) => {
  try {
    const admins = req.body;
    const errors = { noAdminError: String };
    for (var i = 0; i < admins.length; i++) {
      var admin = admins[i];

      await Admin.findOneAndDelete({ _id: admin });
    }
    res.status(200).json({ message: "Admin Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const deleteFaculty = async (req, res) => {
  try {
    const faculties = req.body;
    const errors = { noFacultyError: String };
    for (var i = 0; i < faculties.length; i++) {
      var faculty = faculties[i];

      await Faculty.findOneAndDelete({ _id: faculty });
    }
    res.status(200).json({ message: "Faculty Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const deleteStudent = async (req, res) => {
  try {
    const students = req.body;
    const errors = { noStudentError: String };
    for (var i = 0; i < students.length; i++) {
      var student = students[i];

      await Student.findOneAndDelete({ _id: student });
    }
    res.status(200).json({ message: "Student Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const deleteSubject = async (req, res) => {
  try {
    const subjects = req.body;
    const errors = { noSubjectError: String };
    for (var i = 0; i < subjects.length; i++) {
      var subject = subjects[i];

      await Subject.findOneAndDelete({ _id: subject });
    }
    res.status(200).json({ message: "Subject Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const { department } = req.body;

    await Department.findOneAndDelete({ department });

    res.status(200).json({ message: "Department Deleted" });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

export const addStudent = async (req, res) => {
  try {
    const {
      name,
      dob,
      department,
      contactNumber,
      avatar,
      email,
      section,
      gender,
      batch,
      fatherName,
      // motherName,
      fatherContactNumber,
      // motherContactNumber,
      year,
    } = req.body;
    const errors = { emailError: String };
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      errors.emailError = "Email already exists";
      return res.status(400).json(errors);
    }
    const existingDepartment = await Department.findOne({ department });
    let departmentHelper = existingDepartment.departmentCode;

    const students = await Student.find({ department });
    let helper;
    if (students.length < 10) {
      helper = "00" + students.length.toString();
    } else if (students.length < 100 && students.length > 9) {
      helper = "0" + students.length.toString();
    } else {
      helper = students.length.toString();
    }
    var date = new Date();
    var components = ["STU", date.getFullYear(), departmentHelper, helper];

    var username = components.join("");
    let hashedPassword;
    const newDob = dob.split("-").reverse().join("-");

    hashedPassword = await bcrypt.hash(newDob, 10);
    var passwordUpdated = false;

    const newStudent = await new Student({
      name,
      dob,
      password: hashedPassword,
      username,
      department,
      contactNumber,
      avatar,
      email,
      section,
      gender,
      batch,
      fatherName,
      // motherName,
      fatherContactNumber,
      // motherContactNumber,
      year,
      passwordUpdated,
    });
    await newStudent.save();
    const subjects = await Subject.find({ department, year });
    if (subjects.length !== 0) {
      for (var i = 0; i < subjects.length; i++) {
        newStudent.subjects.push(subjects[i]._id);
      }
    }
    await newStudent.save();
    return res.status(200).json({
      success: true,
      message: "Student registerd successfully",
      response: newStudent,
    });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};

// Multer configuration for handling CSV file upload

if (!fs.existsSync(tempDestination)) {
  fs.mkdirSync(tempDestination, { recursive: true });
}

if (!fs.existsSync(uploadDestination)) {
  fs.mkdirSync(uploadDestination, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDestination);
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const csvUpload = multer({ storage: storage }).single("file");

export const uploadCSV = async (req, res) => {
  try {
    console.log("CSV Upload Request Received");
    console.log("Request Body:", req.body);
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    const studentsData = [];
    const filePath = req.file.path;

    fs.createReadStream(filePath)
      .on("error", (error) => {
        console.error("Error reading file:", error);
        res.status(500).json({ success: false, message: "Error reading file" });
      })
      .pipe(csv())
      .on("data", async (data) => {
        try {
          const existingDepartment = await Department.findOne({
            department: data.department,
          });

          if (!existingDepartment) {
            console.error(`Department not found: ${data.department}`);
            return;
          }

          let departmentHelper = existingDepartment.departmentCode;

          const students = await Student.find({ department: data.department });
          let helper =
            students.length < 10
              ? `00${students.length}`
              : students.length < 100
              ? `0${students.length}`
              : students.length.toString();

          var date = new Date();
          var components = [
            "STU",
            date.getFullYear(),
            departmentHelper,
            helper,
          ];

          var username = components.join("");
          const hashedPassword = data.dob
            ? await bcrypt.hash(data.dob.split("-").reverse().join("-"), 10)
            : null;

          const batchObjectId = data.batch
            ? mongoose.Types.ObjectId(data.batch)
            : null;

          studentsData.push({
            name: data.name || null,
            dob: data.dob || null,
            department: data.department || null,
            contactNumber: data.contactNumber || null,
            avatar: data.avatar || null,
            email: data.email || null,
            section: data.section || null,
            gender: data.gender || null,
            batch: batchObjectId,
            fatherName: data.fatherName || null,
            fatherContactNumber: data.fatherContactNumber || null,
            password: hashedPassword,
            year: data.year,
            username: data.username || username,
            passwordUpdated: false,
          });

        } catch (error) {
          console.error(`Error processing data: ${error.message}`);
          console.error("Problematic _id value:", data._id);
                  }

                  console.log("Students Data:", studentsData);
                  const result = await Student.insertMany(studentsData);
                  console.log("InsertMany Result:", result);
      })
      .on("end", async () => {
        try {
          // const result = await Student.insertMany(studentsData);
          // console.log("InsertMany Result:", result);
                    

          // Move the file to the uploads folder instead of deleting it
          const newFilePath = `${uploadDestination}/${req.file.originalname}`;
          fs.renameSync(filePath, newFilePath);

          res.status(200).json({
            success: true,
            message: "CSV uploaded and processed successfully",
            uploadedFilePath: newFilePath,
          });
        } catch (error) {
          console.error(`Error inserting data to database: ${error.message}`);
          res.status(500).json({
            success: false,
            message: "Error inserting data to database",
            error: error.message,
          });
        }
      });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).json({ success: false, message: "Unexpected error" });
  }
};


// Ensure that the destination directory exists

// if (!fs.existsSync(destinationPath)) {
//   fs.mkdirSync(destinationPath, { recursive: true });
// }

const storage1 = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', 'public', 'csvuploads', 'uploads')); // Adjust the destination path
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    const filePath = path.join("public", "uploads", fileName);
    cb(null, fileName);
  },
});


export const timeTableUpload = multer({ storage: storage1 }).single("file");

export const uploadTimeTable = async (req, res) => {
  try {
    const { filename } = req.file;
    const filePath = req.file.path;

    const fileBuffer = fs.readFileSync(filePath);
    const fileBase64 = fileBuffer.toString('base64');

    const newPdf = new TimeTable({
      filename: filename,
      path: fileBase64,
    });

    await newPdf.save();

    res.json({ success: true, message: "PDF uploaded successfully" });
  } catch (error) {
    console.error("Error uploading PDF:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


export const getPdf = async (req, res) => {
  try {
    const { fileId } = req.params;

    // Validate that the provided fileId is a valid MongoDB ObjectId
    if (!mongoose.isValidObjectId(fileId)) {
      return res.status(400).json({ success: false, message: 'Invalid ObjectId' });
    }

    // Find the corresponding TimeTable document by _id
    const timeTable = await TimeTable.findById(fileId);

    if (!timeTable) {
      return res.status(404).json({ success: false, message: 'PDF not found' });
    }

    // Construct the correct file path
    const filePath = path.join(__dirname, '..', 'public', 'csvuploads', 'uploads', timeTable.filename);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'PDF file not found' });
    }

    // Respond with a success message and the file name
    res.json({ success: true, message: 'PDF retrieved successfully', fileName: timeTable.filename });
  } catch (error) {
    console.error('Error getting PDF:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


// Get the timetable by ID and send the PDF content
export const getTimetableById = async (req, res) => {
  console.log('Reached getTimetableById route');

  try {
    const { timetableId } = req.params;

    // Find the timetable by ID
    const timetable = await TimeTable.findById(timetableId);

    if (!timetable) {
      return res.status(404).json({ success: false, message: 'Timetable not found' });
    }

    // Ensure that the path field contains base64-encoded content
    const { path, filename } = timetable;

    // Log base64 content for debugging
    console.log('Base64 Content:', path);

    // Convert the base64 string to a buffer
    const pdfBuffer = Buffer.from(path, 'base64');

    // Log decoded buffer for debugging
    console.log('Decoded Buffer:', pdfBuffer);

    // Set the appropriate Content-Type header
    res.setHeader('Content-Type', 'application/pdf');

    // Set the Content-Disposition header to trigger download with the given filename
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Set the Access-Control-Allow-Credentials header
    res.header('Access-Control-Allow-Credentials', true);

    // Send the PDF buffer as the response
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error fetching timetable by ID:', error);

    // Handle different error scenarios appropriately
    if (error.name === 'CastError') {
      // Handle CastError (e.g., invalid ObjectId format)
      res.status(400).json({ success: false, message: 'Invalid timetable ID format' });
    } else {
      // Handle other errors
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
};






// Get the most recent timetable
export const getRecentTimetable = async (req, res) => {
  try {
    const recentTimetable = await TimeTable.findOne().sort({ createdAt: -1 });

    if (!recentTimetable) {
      return res.status(404).json({ success: false, message: 'No timetable found' });
    }

    res.json({
      success: true,
      timetableId: recentTimetable._id,
      filename: recentTimetable.filename,
      path: recentTimetable.path,
      createdAt: recentTimetable.createdAt,
    });
  } catch (error) {
    console.error('Error fetching recent timetable:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getAllTimetables = async (req, res) => {
  try {
    const allTimetables = await TimeTable.find();

    if (!allTimetables || allTimetables.length === 0) {
      return res.status(404).json({ success: false, message: 'No timetables found' });
    }

    res.json({ success: true, timetables: allTimetables });
  } catch (error) {
    console.error('Error fetching all timetables:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

export const getStudent = async (req, res) => {
  try {
    const { department, year, section } = req.body;
    const errors = { noStudentError: String };
    const students = await Student.find({ department, year });

    if (students.length === 0) {
      errors.noStudentError = "No Student Found";
      return res.status(404).json(errors);
    }

    res.status(200).json({ result: students });
  } catch (error) {
    const errors = { backendError: String };
    errors.backendError = error;
    res.status(500).json(errors);
  }
};
export const getAllStudent = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    console.log("Backend Error", error);
  }
};

export const getAllFaculty = async (req, res) => {
  try {
    const faculties = await Faculty.find();
    res.status(200).json(faculties);
  } catch (error) {
    console.log("Backend Error", error);
  }
};

export const getAllAdmin = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.status(200).json(admins);
  } catch (error) {
    console.log("Backend Error", error);
  }
};
export const getAllDepartment = async (req, res) => {
  try {
    const departments = await Department.find();
    res.status(200).json(departments);
  } catch (error) {
    console.log("Backend Error", error);
  }
};
export const getAllSubject = async (req, res) => {
  try {
    const subjects = await Subject.find();
    res.status(200).json(subjects);
  } catch (error) {
    console.log("Backend Error", error);
  }
};


export const addQuiz = async (req, res) => {
  try {
    const { title, questions } = req.body;

    const newQuiz = new QuizzSchema({
      title,
      questions,
    });

    const result = await newQuiz.save();

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizzSchema.find();
    res.json(quizzes);
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};


  export const getQuizById = async (req, res) => {
    const quizId = req.params.quizId;

    try {
      const quiz = await QuizzSchema.findById(quizId);
      if (!quiz) {
        return res.status(404).send("Quiz not found");
      }

      res.json(quiz);
    } catch (error) {
      console.error("Error fetching quiz by ID:", error);
      res.status(500).send("Internal Server Error");
    }
  }

  // Endpoint to update a quiz by ID
export const updateQuiz = 
  async (req, res) => {
    const quizId = req.params.quizId;

    try {
      const updatedQuiz = await QuizzSchema.findByIdAndUpdate(quizId, req.body, {
        new: true,
      });
      if (!updatedQuiz) {
        return res.status(404).send("Quiz not found");
      }

      res.json(updatedQuiz);
    } catch (error) {
      console.error("Error updating quiz by ID:", error);
      res.status(500).send("Internal Server Error");
    }
  }

// Endpoint to delete a quiz by ID
export const deleteQuiz = 
  async (req, res) => {
    const quizId = req.params.quizId;

    try {
      const deletedQuiz = await Quiz.findByIdAndDelete(quizId);
      if (!deletedQuiz) {
        return res.status(404).send("Quiz not found");
      }

      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Error deleting quiz by ID:", error);
      res.status(500).send("Internal Server Error");
    }
  }

export const SubmitQuiz =
  async (req, res) => {
    const quizId = req.params.quizId;
    const submittedAnswers = req.body.answers;
    const userId = req.body.userId;
    try {
      const quiz = await Quiz.findById(quizId);
      if (!quiz) {
        return res.status(404).send("Quiz not found");
      }

      let score = 0;
      quiz.questions.forEach((question, index) => {
        if (submittedAnswers[index] === question.correctOptionIndex) {
          score++;
        }
      });

      quiz.scores.push({ userId, score });
      await quiz.save();

      res.json({ score });
    } catch (error) {
      console.error("Error submitting quiz:", error);
      res.status(500).send("Internal Server Error");
    }
  }




