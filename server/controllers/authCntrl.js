const User = require("../models/User.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { error, success } = require("../utils/responsWrapper.js");

const signupController = async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      // return res.status(400).send("All fields are required");
      return res.send(error(400,'All fields are required'))
    }
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      // return res.status(409).send("User is Already Registerd");
      return res.send(error(409,'User is Already Registerd'))
    }

    const hashPasswaord = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashPasswaord,
    });

    // newUser jo abhi  create hua hai
  // const newUser =await User.findById(user._id);

    // return res.status(201).json({
    //   // default 200 status
    //   user,
    // });

    return res.send(success(201,"user is created (signed up)"));
  } catch (e) {
    return (error(401," Error found fields are required"))
  }
};

const logInController = async (req, res) => {
  try {
    const { email, password  } = req.body;
    if (!email || !password  ) {
      // return res.status(400).send("All fields are required");
      return res.send(error(400,'All field are required'))

    }
    // const user = await User.findOne({ email });
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      // return res.status(404).send("User is not registered");
      return res.send(error(404,'User is not registered'))

    }

    const matched = await bcrypt.compare(password, user.password);
    if (!matched) {
      // return res.status(403).send("Incorrect password");\
      return res.send(error(403,'Incorrect Password'))

    }

    // return res.send(user);
    const accessToken = generateAccessToken({
      _id: user._id,
    });

    const refreshToken = generateRefreshToken({
      _id: user._id,
    });
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      secure: true,
    });

    // console.log("generated regresh token in refresh call check cookie =>",refreshToken);
    // res.status(201).json({ AccessToken });;
    return res.send(success(200,{accessToken}))

    // console.log({AccessToken});
  } catch (e) {
    return res.send(error(401,"Error User not registerd "))
  }
};
// this api will check the refreshToken validity and generate a new acess token
const refreshAccessToken = async (req, res) => {
  const cookies = req.cookies;
  console.log(req.cookies);
  
  if (!cookies.jwt){
    
    // return res.status(401).send(" Refreshhh token is required");\
    return res.send(error(401,'Refresh token is required'))

  }
  const refreshToken = cookies.jwt;
  // if (!refreshToken) {
  //   // return res.status(401).send("Refresh token is required");
  //   return res.send(error(401,'Refresh token is required'))

  // }
  try {
    const decode = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_PRIVATE_KEY
    );
    const _id = decode._id;
    const accessToken = generateAccessToken({ _id });
    // return res.status(201).json({ AccessToken });
    return res.send(success(201,{accessToken:accessToken}))

  } catch (e) {
    // return res.status(404).send("Invalid Refresh Token");
    return res.send(error(401,'Invalid token refresh token which is present in cookie'))

  }
};

const logoutController = async (req, res)=>{
 try {
  res.clearCookie('jwt',{
    httpOnly:true,
    secure:true
  })
  return res.send(success(200, "User Log out"));
 } catch (e) {
  res.send(error(500,e.message))
 }

}


// internal function
const generateAccessToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.ACCESS_TOKEN_PRIVATE_KEY, {
      expiresIn: "1d",
    });
    console.log(" Generated Access token =>",token);
    return token;
  } catch (e) {
    console.log("Error found to generate AccessToken", error);
  }
};

const generateRefreshToken = (data) => {
  try {
    const token = jwt.sign(data, process.env.REFRESH_TOKEN_PRIVATE_KEY, {
      expiresIn: "10d",
    });
    console.log("generated refresh token =>",token);
    return token;
  } catch (e) {
    console.log("Error found to generate RefreshToken", error);
  }
};

module.exports = {
  logInController,
  signupController,
  refreshAccessToken,
  logoutController
};
