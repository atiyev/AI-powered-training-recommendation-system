import { Schema, model, Document } from 'mongoose';

// Define the interface for TypeScript
export interface IUser extends Document {
    name: string;
    department: string;
    title: string;
    completedTrainings: string[];
    createdAt: Date;
    updatedAt: Date;
}

// Create the schema (database structure)
const userSchema = new Schema<IUser>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true
        },
        department: {
            type: String,
            required: [true, 'Department is required'],
            trim: true
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true
        },
        completedTrainings: {
            type: [String], // Array of strings
            default: [] // Default to empty array
        }
    },
    {
        timestamps: true // This automatically adds createdAt and updatedAt fields
    }
);

// Create and export the model
export const User = model<IUser>('User', userSchema);