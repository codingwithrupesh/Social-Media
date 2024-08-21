const express = require("express");
const app = express();
require('dotenv').config()
const {connectDB} = require('./db/index.js')
const authRouter = require('./routers/authRtrs.js')
const postRouter = require('./routers/postRouter.js')
const userRouter = require('./routers/userRouter.js')
const morgon = require('morgan');
const cookieParser = require('cookie-parser')
const cors = require('cors')
 const cloudinaryConnect = require('./cloudinary/cloudinari.js')
// import {v2 as cloudinary} from 'cloudinary';


cloudinaryConnect(); 



connectDB();

//middleware
app.use(express.json({ limit: '10MB' }));


app.use(morgon('common'));
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin:'http://localhost:3000',
}))



app.use('/auth',authRouter);
app.use('/posts',postRouter)
app.use('/user',userRouter)
app.get('/',(req,res)=>{
    res.status(200).send("ok from server");
})
 

app.listen(process.env.PORT || 4001,()=>{
    console.log("Server is Lestening on PORT" ,process.env.PORT);
})