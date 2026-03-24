import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.js'
import departmentRouter from './routes/department.js'
import employeeRouter from './routes/employee.js'
import connectToDatabase from './db/db.js'
import salaryRouter from './routes/salary.js'
import leaveRouter from './routes/leave.js'
import settingRouter from './routes/setting.js'
import dashboardRouter from './routes/dashboard.js'
import attendanceRouter from './routes/Attendance.js'
import ProjectRouter from './routes/Project.js'
import dotenv from 'dotenv';
dotenv.config();
import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

connectToDatabase()

const app = express()
const port = process.env.PORT || 5000
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,https://product-omega-three.vercel.app')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }

    callback(new Error(`CORS blocked for origin: ${origin}`))
  },
  credentials: true
}
))
app.use(express.json())
app.get("/", (req, res) => {
  res.send("Backend is running successfully on Vercel!");
});

app.use('/api/auth', authRouter)
app.use('/api/department', departmentRouter)
app.use('/api/employee', employeeRouter)
app.use('/api/salary', salaryRouter)
app.use('/api/leave', leaveRouter)
app.use('/api/setting', settingRouter)
app.use('/api/dashboard', dashboardRouter)

app.use('/api/project', ProjectRouter)
app.use('/api/attendance', attendanceRouter)
app.listen(port, () => {
  console.log(`Server is Running on port ${port}`)
})
