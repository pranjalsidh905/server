import express from "express";
import auth from "../middleware/auth.js";
import {
  adminLogin,
  updateAdmin,
  addAdmin,
  addFaculty,
  getFaculty,
  addSubject,
  getSubject,
  addStudent,
  getStudent,
  addDepartment,
  getAllStudent,
  getAllFaculty,
  getAllAdmin,
  getAllDepartment,
  getAllSubject,
  updatedPassword,
  getAdmin,
  deleteAdmin,
  deleteDepartment,
  deleteFaculty,
  deleteStudent,
  deleteSubject,
  createNotice,
  getNotice,
  uploadCSV,
  csvUpload,
  timeTableUpload,
  uploadTimeTable,
  getPdf,
  addQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  SubmitQuiz,
  getRecentTimetable,
  getTimetableById,
  getAllTimetables  
} from "../controller/adminController.js";
const router = express.Router();

router.post("/login", adminLogin);
router.post("/updatepassword", auth, updatedPassword);
router.get("/getallstudent", auth, getAllStudent);
router.post("/createnotice", auth, createNotice);
router.get("/getallfaculty", auth, getAllFaculty);
router.get("/getalldepartment", auth, getAllDepartment);
router.get("/getallsubject", auth, getAllSubject);
router.get("/getalladmin", auth, getAllAdmin);
router.post("/updateprofile", auth, updateAdmin);
router.post("/addadmin", auth, addAdmin);
router.post("/adddepartment", auth, addDepartment);
router.post("/addfaculty", auth, addFaculty);
router.post("/getfaculty", auth, getFaculty);
router.post("/addsubject", auth, addSubject);
router.post("/getsubject", auth, getSubject);
router.post("/addstudent", auth, addStudent);
router.post("/csvUpload", auth, csvUpload, uploadCSV);
router.post("/uploadTimeTable", auth, timeTableUpload, uploadTimeTable);
router.get('/get-pdf/:fileId', auth, getPdf);
router.get('/getTimetableById/recent', auth, getRecentTimetable);
router.get('/getTimetableById/:timetableId', auth, getTimetableById)
router.get('/getAllTimetables', auth ,getAllTimetables);
router.post("/getstudent", auth, getStudent);
router.post("/getnotice", auth, getNotice);
router.post("/getadmin", auth, getAdmin);
router.post("/deleteadmin", auth, deleteAdmin);
router.post("/deletefaculty", auth, deleteFaculty);
router.post("/deletestudent", auth, deleteStudent);
router.post("/deletedepartment", auth, deleteDepartment);
router.post("/deletesubject", auth, deleteSubject);
router.post("/add-quiz", auth, addQuiz)
router.get("/get-all-quizzes", auth, getQuizzes)
router.get("/get-quiz/:quizId", auth, getQuizById)
router.put("/updateQuiz/:quizId", auth, updateQuiz)
router.delete("/deleteQuiz/:quidId", auth, deleteQuiz)
router.post("/submit-quiz/:quizId", auth, SubmitQuiz)

export default router;
