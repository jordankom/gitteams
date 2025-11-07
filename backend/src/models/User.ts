import { Schema, model, Document, Types } from 'mongoose';
import { encrypt, decrypt } from '../utils/encryption';

export interface IUser extends Document {
    id: string;
    _id: Types.ObjectId;
    name: string;
    passwordHash: string;
    githubToken: string;
    createdAt: Date;
    updatedAt: Date;
    getDecryptedToken(): string;
}

const userSchema = new Schema<IUser>(
    {
        name: { type: String, required: true, unique: true, trim: true },
        passwordHash: { type: String, required: true },
        githubToken: { type: String, required: true, trim: true },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (_doc, ret: Record<string, any>) => {
                ret.id = ret._id?.toString();
                delete ret._id;
                delete ret.passwordHash;
                delete ret.githubToken; // ⚠️ ne jamais exposer le token
            },
        },
    }
);

// 🔒 Chiffrer le token avant sauvegarde
userSchema.pre<IUser>('save', function (next) {
    if (this.isModified('githubToken')) {
        this.githubToken = encrypt(this.githubToken);
    }
    next();
});

// 🔑 Méthode pour récupérer le token déchiffré
userSchema.methods.getDecryptedToken = function (this: IUser): string {
    return decrypt(this.githubToken);
};

// 🔹 Virtual id pour compatibilité frontend
userSchema.virtual('id').get(function (this: IUser) {
    return this._id.toHexString();
});

export const User = model<IUser>('User', userSchema);
export default User;
