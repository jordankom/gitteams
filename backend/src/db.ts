import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.resolve(__dirname, "../.env") });

//dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URL!);
        console.log("✅ MongoDB connecté !");
    } catch (error) {
        console.error("❌ Erreur de connexion MongoDB :", error);
        process.exit(1); // quitte le serveur si la connexion échoue
    }
};

export default connectDB;
