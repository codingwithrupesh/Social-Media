const jwt = require('jsonwebtoken');
const {error} = require('../utils/responsWrapper.js');
const User = require('../models/User.js');
module.exports = async (req, res, next) => {
  console.log("I am a middleware");
  if (
    !req.headers ||
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  ) {
    // return res.status(404).send("Authorization Header is required");
    
    return res.send(error(401,'Authorization header is required'))

  }

  const acessToken = req.headers.authorization.split(" ")[1];
  

  // console.log( "acessToken is:", acessToken);
  

try {
   const decode = jwt.verify(acessToken,process.env.ACCESS_TOKEN_PRIVATE_KEY);
   req._id = decode._id

   const user = await User.findById(req._id);
   if(!user){
    return res.send(error(404, " user not found"));
   }
  
   next();
} catch (e) {
    // return res.status(404).send("Invalid Acess Key");
    console.log("error if  unothrized conditions", e);
    return res.send(error(401,'Invalid Acess key !!'))


    //  console.log(error);
}
// next() time barwad 

  
};
