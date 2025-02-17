import mongoose, { Document, Schema } from "mongoose";

export interface IResource extends Document {
    name: string;
    description?: string;
    deletedAt?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

const ResourceSchema = new Schema<IResource>(
    {
        name: { type: String, required: true },
        description: { type: String, default: "" },
        deletedAt: { type: Date, default: null }
    },
    { timestamps: true }
);

export const Resource = mongoose.model<IResource>("Resource", ResourceSchema);
