const cloudinary = require('cloudinary').v2; 
const dotenv = require('dotenv') ; 
dotenv.config('./env') ; 
  
const cloudinaryConnect = () => {
    try {
        cloudinary.config({ 
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
            api_key: process.env.CLOUDINARY_API_KEY, 
            api_secret: process.env.CLOUDINARY_API_SECRET
          });
        console.log("clodinary connected successfully") ; 
    } catch (e) {
        console.log("cloudinary error",e) ; 
    }
}

module.exports = cloudinaryConnect ; 