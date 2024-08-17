import mongoose from "mongoose";

const connection = {
  isConnected: false,
};

export async function dbConnect() {
  if (connection.isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(
        process.env.MongoDB_URI
    );

    connection.isConnected = db.connections[0].readyState === 1;
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw new Error("Failed to connect to MongoDB"+error.message);
  }
}

 