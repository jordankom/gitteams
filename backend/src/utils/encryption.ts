// src/utils/crypto.ts
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

const ALGO = "aes-256-cbc";

// Key: 32 bytes. Si TOKEN_SECRET dans .env.example -> on l'utilise, sinon on génère une clé mémoire.
const KEY = process.env.TOKEN_SECRET
    ? crypto.createHash("sha256").update(process.env.TOKEN_SECRET).digest()
    : crypto.randomBytes(32);

// IV sera généré aléatoirement à chaque encryption et préfixé dans la chaîne retournée.
export const encryptToken = (plain: string): string => {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGO, KEY, iv);
    const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
    return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

export const decryptToken = (payload: string): string => {
    const [ivHex, encryptedHex] = payload.split(":");
    if (!ivHex || !encryptedHex) throw new Error("Invalid token format");
    const iv = Buffer.from(ivHex, "hex");
    const encrypted = Buffer.from(encryptedHex, "hex");
    const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
};
