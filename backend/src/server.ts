import express from "express";
import dotenv from "dotenv";
import connectDB from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware pour parser JSON
app.use(express.json());

console.log("MONGODB_URL =", process.env.MONGODB_URL);
// Connexion à MongoDB
connectDB();

// Route test
app.get("/", (req, res) => {
    res.send("Backend fonctionne et DB connectée !");
});

// Démarrage serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
