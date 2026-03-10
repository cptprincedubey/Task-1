require('dotenv').config();
const express = require('express');
const cookieParser = require("cookie-parser");
const authRoutes = require('./src/routes/auth.routes');
const connectDB = require('./src/config/db/db'); 
const cors = require('cors');

connectDB();            

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use("/api/auth",authRoutes);

let port = process.env.PORT || 3000;

app.listen(port, ()=>{
    console.log(`server is running on port ${port}`);

});

