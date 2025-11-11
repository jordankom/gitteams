import { Schema, model, Document, Types } from 'mongoose';
import crypto from 'crypto';

export interface IProject extends Document {
    userId: Types.ObjectId;
    title: string;
    org: string;
    description?: string | null;
    minPeople: number;
    maxPeople: number;
    inviteKey: string;         // 🔑 clé secrète pour le lien public
    nextGroupNumber: number;   // si tu l’utilises déjà
    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    org:   { type: String, required: true, trim: true },
    description: { type: String, default: null },
    minPeople: { type: Number, required: true, min: 1 },
    maxPeople: { type: Number, required: true, min: 1 },
    inviteKey: { type: String, required: true, index: true },       // ✅ NOUVEAU
    nextGroupNumber: { type: Number, default: 1 },
}, { timestamps: true });

projectSchema.pre('validate', function (next) {
    if (!this.inviteKey) {
        this.inviteKey = crypto.randomBytes(16).toString('hex'); // 32 chars
    }
    next();
});

const Project = model<IProject>('Project', projectSchema);
export default Project;
