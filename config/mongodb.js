import mongoose from "mongoose";

const connectDB = async(req, res)=>{

    try {
        
        await mongoose.connect(`${process.env.MONGODB_URL}/auth`);
        console.log("Database connected");
        
        mongoose.connection.on('error', (err)=>{
            console.log("Database connection error", err);
        })
        
    } catch (error) {
        console.log("Failed to connect to MongoDB", error);
    }

}

export default connectDB;