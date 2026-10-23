const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    let dbUri = process.env.MONGODB_URI;

    if (!dbUri || dbUri.trim() === '') {
      console.log('No MONGODB_URI provided in environment. Starting in-memory MongoDB server...');
      mongoServer = await MongoMemoryServer.create();
      dbUri = mongoServer.getUri();
      console.log(`In-memory MongoDB started at: ${dbUri}`);
    }

    const conn = await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
