import { Schema, model, Document, Types } from 'mongoose';

export interface IParticipant {
    username: string;
    email: string;
}

export interface IGroup extends Document {
    projectId: Types.ObjectId;
    number: number;           // auto-incrément par projet
    name: string;             // "Groupe X"
    participants: IParticipant[];
    createdAt: Date;
    updatedAt: Date;
}

const participantSchema = new Schema<IParticipant>({
    username: { type: String, required: true, trim: true },
    email:    { type: String, required: true, trim: true },
}, { _id: false });

const groupSchema = new Schema<IGroup>({
    projectId:   { type: Schema.Types.ObjectId, ref: 'Project', required: true, index: true },
    number:      { type: Number, required: true }, // unique par projet
    // 👇 génère automatiquement "Groupe <number>" si name est omis
    name:        {
        type: String,
        required: true,
        default: function (this: IGroup) {
            const n = (this as any).number || 0;
            return n ? `Groupe ${n}` : 'Groupe';
        }
    },
    participants:{ type: [participantSchema], default: [] },
}, { timestamps: true });

// Unicité (projectId, number)
groupSchema.index({ projectId: 1, number: 1 }, { unique: true });

export default model<IGroup>('Group', groupSchema);
