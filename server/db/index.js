const mongoose = require('mongoose')

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(process.env.MONGODB_URI
       );
    // console.log(
    //   `\n MongoDB connection !! DB HOST: ${connectionInstance.connection.host}`
    // );

    console.log(" DB is connected");
  } catch (error) {
    console.log("MONGODB connection error", error);
    process.exit(1); // throw bhi kar sakte the
  }
};

module.exports = {connectDB};
