require('dotenv').config();
const express = require('express');
const cookieParser = require("cookie-parser");
const authRoutes = require('./src/routes/auth.routes');
const connectDB = require('./src/config/db/db'); 
const cors = require('cors');

connectDB();            

const app = express();

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("CORS policy: This origin is not allowed"));
    }
  },
  credentials: true,
}));
app.options("*", cors({ origin: allowedOrigins, credentials: true }));
app.use("/api/auth",authRoutes);

let port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);

});

