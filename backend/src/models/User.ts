import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    id: string;
    name: string;
    passwordHash: string;
    githubToken: string; // ⬅️ obligatoire maintenant
    createdAt: Date;
    updatedAt: Date;
}

const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
        },
        githubToken: {
            type: String,
            required: true, // ⬅️ obligatoire
            trim: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
            versionKey: false,
            transform: (_, ret) => {
                ret.id = ret._id;
                delete ret._id;
            },
        },
    }
);

userSchema.virtual('id').get(function (this: IUser) {
    return this._id.toHexString();
});

export const User = model<IUser>('User', userSchema);
