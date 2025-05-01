import mongoose from 'mongoose';

const connectDB = async () => {

  const URI =  process.env.MONGO_URI || 'mongodb+srv://dhyan2815:mykhata1234@mykhata.qcfkaci.mongodb.net/' ;
  
  console.log('URI:', URI);

  try {
    const conn = await mongoose.connect(URI); 
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
