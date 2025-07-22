import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Database connected: ${conn.connection.host}`.bgGreen.white);
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
