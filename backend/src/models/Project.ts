import { Schema, model, Document, Types } from 'mongoose';
import crypto from 'crypto';
export interface IProject extends Document {
    userId: Types.ObjectId;
    title: string;
    org: string;
    description?: string | null;
    minPeople: number;            // ✅ nouveau
    maxPeople: number;            // ✅ nouveau
    // 🔽 nouveaux champs
    inviteSlug: string;        // lien public (jeton non sensible)
    nextGroupNumber: number;   // compteur atomique


    createdAt: Date;
    updatedAt: Date;
}

const projectSchema = new Schema<IProject>(
    {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
        title:  { type: String, required: true, trim: true },
        org:    { type: String, required: true, trim: true },
        description: { type: String, default: null },

        // ✅ nouveaux champs
        minPeople: { type: Number, required: true, min: 1 },
        maxPeople: {
            type: Number,
            required: true,
            min: 1,
            validate: {
                validator(this: any, v: number) {
                    return typeof this.minPeople === 'number' ? v >= this.minPeople : true;
                },
                message: 'maxPeople doit être ≥ minPeople',
            },
        },
        // ✅ nouveaux champs
        inviteSlug: {
            type: String,
            unique: true,
            index: true,
            required: true,
            default: () => crypto.randomBytes(16).toString('hex'), // 32 chars
        },
        nextGroupNumber: { type: Number, required: true, default: 1 },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (_doc, ret: Record<string, any>) => {
                if (!ret.description) ret.description = 'aucune description';
            },
        },
    }
);

const Project = model<IProject>('Project', projectSchema);
export default Project;
